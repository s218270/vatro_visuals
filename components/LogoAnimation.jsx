"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { sRGBEncoding } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import GlitchButton from "./GlitchButton";
import GradientBar from "./GradientBar";

import LoaderOverlay from "./LoaderOverlay";
import ThreeFallbackScene from "./ThreeFallbackScene";
import { isIOS, isMobile, getResponsiveRadius } from "../utils/logoUtils";
import { createSkyboxCubeMap } from "../lib/createSkyboxCubeMap";

gsap.registerPlugin(ScrollTrigger);

export default function LogoAnimation({
  startAngleDeg = 10,
  startVerticalTiltDeg = 110,
  startRadius = 0.55,
  startSkewDeg = 25,
  angleDeltaDeg = 240,
  verticalTiltDeltaDeg = -130,
  invertVertical = false,
  zoomEndRadius = 2.0, // new prop for zoomed out radius
  scrollToSection, // <-- add prop
}) {
  const mountRef = useRef();
  const [loading, setLoading] = useState(true);
  const [webgl2Supported, setWebgl2Supported] = useState(true);
  const [forceFallback, setForceFallback] = useState(true); // Wymuszony fallback na sztywno
  const [showStaticBg, setShowStaticBg] = useState(false);
  const [fallbackLoading, setFallbackLoading] = useState(true);
  const fallbackMountRef = useRef();

  useEffect(() => {
    // Sprawdź wsparcie WebGL2 i wymuś fallback na iOS/mobilnych
    if (typeof window !== "undefined") {
      let fallback = false;
      if (isIOS() || isMobile()) fallback = true;
      try {
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl2");
        setWebgl2Supported(!!gl);
        if (!gl) fallback = true;
        // Sprawdź limity GPU
        if (gl) {
          const maxCube = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);
          if (maxCube < 2048) fallback = true;
        }
      } catch (e) {
        fallback = true;
        setWebgl2Supported(false);
      }
      setForceFallback(fallback);
    }
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!webgl2Supported || forceFallback) return; // nie uruchamiaj animacji jeśli fallback

    // Zapobiegaj wielokrotnej inicjalizacji (np. StrictMode)
    if (mount.__threeInitialized) return;
    mount.__threeInitialized = true;

    // Responsive radius helper now imported from utils
    let radius = getResponsiveRadius(startRadius);

    // Scene setup
    const scene = new THREE.Scene();
    window._fallbackScene = scene;
    const camera = new THREE.PerspectiveCamera(
      30,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    // Usuń WSZYSTKIE dzieci mount przed dodaniem nowego canvas
    while (mount.firstChild) {
      mount.removeChild(mount.firstChild);
    }
    mount.appendChild(renderer.domElement);

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    const spot = new THREE.SpotLight(0xffffff, 2.5);
    spot.position.set(10, 10, 10);
    scene.add(ambient, spot);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);

    // Model info (reverse z positions for all models)
    const modelInfos = [
      { name: "V.glb", position: [-0.002, 0, 0] },
      { name: "A.glb", position: [0.002, 0, -0.1] },
      { name: "Dot.glb", position: [0, 0, -0.2] },
      { name: "T.glb", position: [0, 0, 0.1] },
    ];

    const dotPosition = new THREE.Vector3();
    const modelPositions = [];
    let modelsLoaded = 0;

    // --- Set HDR jako environment map dla modeli (bez tła) ---
    new RGBELoader()
      .setDataType(THREE.FloatType)
      .setPath("/hdri/")
      .load(
        "stock-photo-degree-full-panorama-environment-map-of-empty-black-room-studio-with-metal-elements-d-re.hdr",
        (hdrEquirect) => {
          const envMap =
            pmremGenerator.fromEquirectangular(hdrEquirect).texture;
          scene.environment = envMap;

          const loader = new GLTFLoader();

          modelInfos.forEach(({ name, position }) => {
            loader.load(`/meshes/${name}`, (gltf) => {
              const model = gltf.scene;
              model.position.set(...position);
              modelPositions.push(model.position.clone());
              if (name === "Dot.glb") dotPosition.copy(model.position);

              model.traverse((child) => {
                if (child.isMesh) {
                  child.material = new THREE.MeshStandardMaterial({
                    color: child.material.color || 0xffffff,
                    map: child.material.map || null,
                    envMap: webgl2Supported ? envMap : null,
                    envMapIntensity: 1.5,
                    metalness: 1.0,
                    roughness: webgl2Supported ? 0.1 : 0.2,
                  });
                }
              });

              scene.add(model);
              modelsLoaded++;
              if (modelsLoaded === modelInfos.length) {
                setLoading(false); // hide loader when all models loaded

                // Calculate centroid of all models
                const center = new THREE.Vector3();
                modelPositions.forEach((pos) => center.add(pos));
                center.divideScalar(modelPositions.length);

                // Wszystkie modele załadowane — teraz ustaw kamerę i animację
                let skewAngle = THREE.MathUtils.degToRad(startSkewDeg);
                const initialVerticalTilt =
                  THREE.MathUtils.degToRad(startVerticalTiltDeg);
                // Offset the starting angle by 180° (π radians) to start from the opposite side
                const angleOffset =
                  THREE.MathUtils.degToRad(startAngleDeg) + Math.PI;
                const angleDelta = THREE.MathUtils.degToRad(angleDeltaDeg);
                let verticalTiltDelta =
                  THREE.MathUtils.degToRad(verticalTiltDeltaDeg);
                if (invertVertical) verticalTiltDelta = -verticalTiltDelta;

                // --- ENTRY ANIMATION LOGIC ---
                const playScrollAnimations = () => {
                  // Animate skew (roll) value from startSkewDeg to 0 (0-70% scroll)
                  let skewObj = { value: skewAngle };
                  gsap.to(skewObj, {
                    value: 0,
                    scrollTrigger: {
                      trigger: mount,
                      start: "top top",
                      end: "280%", // 70% of 400vh
                      scrub: true,
                    },
                    onUpdate: () => {
                      skewAngle = skewObj.value;
                    },
                  });

                  // Animate each model's z position to 0 on scroll (0-70% scroll)
                  scene.children.forEach((child) => {
                    if (child.isGroup || child.isMesh) {
                      gsap.to(child.position, {
                        z: 0,
                        scrollTrigger: {
                          trigger: mount,
                          start: "top top",
                          end: "280%", // 70% of 400vh
                          scrub: true,
                        },
                      });
                    }
                  });

                  // Camera animation: angle/tilt for 0-100% scroll (continuous, as before)
                  function updateCameraPosition(
                    angleRad,
                    verticalTiltRad,
                    extra = {}
                  ) {
                    // extra: {x, y, roll} offset for camera position and additional roll
                    let extraX = extra.x || 0;
                    let extraY = extra.y || 0;
                    let extraRoll = extra.roll || 0; // rotation around Z axis (roll)
                    const x = radius * Math.sin(angleRad) + extraX;
                    const y = radius * Math.cos(verticalTiltRad) + extraY;
                    const z = radius * Math.cos(angleRad);
                    const camPos = new THREE.Vector3(
                      center.x + x,
                      center.y + y,
                      center.z + z
                    );
                    camera.position.copy(camPos);
                    const up = new THREE.Vector3(0, 1, 0);
                    const lookAtMatrix = new THREE.Matrix4();
                    lookAtMatrix.lookAt(camPos, center, up);
                    const quat = new THREE.Quaternion();
                    quat.setFromRotationMatrix(lookAtMatrix);
                    // Apply extra roll (rotation around Z axis, like tilting your head)
                    if (extraRoll) {
                      const rollQuat = new THREE.Quaternion();
                      rollQuat.setFromAxisAngle(
                        new THREE.Vector3(0, 0, 1),
                        extraRoll
                      );
                      quat.multiply(rollQuat);
                    }
                    // Apply skew (roll) as before
                    const skewQuat = new THREE.Quaternion();
                    skewQuat.setFromAxisAngle(
                      new THREE.Vector3(0, 0, 1),
                      -skewAngle
                    );
                    quat.multiply(skewQuat);
                    camera.quaternion.copy(quat);
                  }

                  updateCameraPosition(-angleOffset, initialVerticalTilt);

                  const orbit = {
                    angle: -angleOffset, // start angle
                    verticalTilt: initialVerticalTilt, // start vertical tilt
                  };
                  gsap.set(orbit, {
                    angle: -angleOffset,
                    verticalTilt: initialVerticalTilt,
                  });
                  // Animacja orbity przez cały scroll (0-100%)
                  gsap.to(orbit, {
                    id: "camera-orbit-1",
                    angle: -angleOffset - Math.PI * 1.1, // rotate further right
                    verticalTilt: Math.PI / 2 + Math.PI * 0.1, // tilt more forward
                    scrollTrigger: {
                      trigger: mount,
                      start: "top top",
                      end: "400%", // 100% of 400vh
                      scrub: true,
                      onUpdate: (self) => {
                        let roll = 0;
                        // Use self?.progress or fallback to ScrollTrigger's progress
                        const progress =
                          self && typeof self.progress === "number"
                            ? self.progress
                            : self &&
                              self.scrollTrigger &&
                              typeof self.scrollTrigger.progress === "number"
                            ? self.scrollTrigger.progress
                            : 0;
                        if (progress > 0.55) {
                          // tilt starts at 55%
                          roll = -((progress - 0.55) / 0.45) * 0.35;
                        }
                        updateCameraPosition(orbit.angle, orbit.verticalTilt, {
                          roll,
                        });
                      },
                    },
                    onUpdate: (self) => {
                      let roll = 0;
                      const progress =
                        self && typeof self.progress === "number"
                          ? self.progress
                          : self &&
                            self.scrollTrigger &&
                            typeof self.scrollTrigger.progress === "number"
                          ? self.scrollTrigger.progress
                          : 0;
                      if (progress > 0.55) {
                        roll = -((progress - 0.55) / 0.45) * 0.35;
                      }
                      updateCameraPosition(orbit.angle, orbit.verticalTilt, {
                        roll,
                      });
                    },
                    onComplete: () => {
                      ScrollTrigger.refresh();
                    },
                  });

                  // Animate radius (zoom out) after 45% scroll, mocniej i wcześniej
                  let radiusObj = {
                    value: getResponsiveRadius(startRadius),
                  };
                  gsap.to(radiusObj, {
                    value: getResponsiveRadius(startRadius * 1.35), // mocniejsze oddalenie
                    scrollTrigger: {
                      trigger: mount,
                      start: "180%", // 45% of 400vh
                      end: "400%", // 100%
                      scrub: true,
                    },
                    ease: "power1.inOut",
                    onUpdate: () => {
                      radius = radiusObj.value;
                    },
                  });

                  ScrollTrigger.refresh();
                };

                // --- ENTRY ANIMATION: Always play on mount, camera always scroll-synced ---
                scene.children.forEach((child, i) => {
                  if (child.isGroup || child.isMesh) {
                    const origY = child.position.y;
                    child.position.y = origY + 1; // start above
                    gsap.to(child.position, {
                      y: origY,
                      duration: 1.1,
                      delay: i * 0.08,
                      ease: "power2.out",
                    });
                  }
                });
                // Always enable scroll-driven logic immediately
                playScrollAnimations();
              }
            });
          });
        }
      );

    // Proceduralny skybox jako cubemap: wyodrębnione do createSkyboxCubeMap
    const { texture: skyboxTexture } = createSkyboxCubeMap(renderer);
    scene.background = skyboxTexture;

    // Handle resize
    function handleResize() {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      // Update radius responsively
      radius = getResponsiveRadius(startRadius);
      ScrollTrigger.refresh();
    }
    window.addEventListener("resize", handleResize);

    // --- ANIMACJA: renderuj tylko scenę ---
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      ScrollTrigger.getAll().forEach((st) => st.kill());
      renderer.dispose();
      if (mount && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      mount.__threeInitialized = false;
    };
  }, [
    startAngleDeg,
    startVerticalTiltDeg,
    startRadius,
    startSkewDeg,
    angleDeltaDeg,
    verticalTiltDeltaDeg,
    invertVertical,
    webgl2Supported,
    forceFallback,
  ]);

  // Fallback: statyczne tło i uproszczone modele jeśli brak WebGL2 lub wymuszony fallback
  useEffect(() => {
    if (!webgl2Supported || forceFallback) {
      console.log("[FALLBACK USEEFFECT] fallback rendering active");
      setShowStaticBg(false);
      const timeout = setTimeout(() => setShowStaticBg(true), 2000);
      return () => clearTimeout(timeout);
    }
  }, [webgl2Supported, forceFallback]);

  // Fallback: uproszczona scena 3D na statycznym tle
  // Zastąpione przez osobny komponent ThreeFallbackScene

  // Fallback: statyczne tło i uproszczone modele jeśli brak WebGL2 lub wymuszony fallback
  useEffect(() => {
    if (!webgl2Supported || forceFallback) {
      setShowStaticBg(false);
      const timeout = setTimeout(() => setShowStaticBg(true), 2000);
      return () => clearTimeout(timeout);
    }
  }, [webgl2Supported, forceFallback]);

  // Fallback: uproszczona scena 3D na statycznym tle
  useEffect(() => {
    if (!webgl2Supported || forceFallback) {
      const mount = fallbackMountRef.current;
      if (!mount) return;
      // Zapobiegaj wielokrotnej inicjalizacji fallbacku
      if (mount.__threeInitialized) return;
      mount.__threeInitialized = true;
      // Responsive radius helper
      function getResponsiveRadius(base) {
        return window.innerWidth < 768 ? base * 1.3 : base;
      }
      let radius = getResponsiveRadius(startRadius);
      // Scene setup
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        30,
        mount.clientWidth / mount.clientHeight,
        0.1,
        100
      );
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.outputEncoding = sRGBEncoding;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      // Usuń wszystkie dzieci mount przed dodaniem canvas
      while (mount.firstChild) {
        mount.removeChild(mount.firstChild);
      }
      mount.appendChild(renderer.domElement);
      // Lighting (dodaj PRZED modelami, by modele były oświetlone od początku)
      const ambient = new THREE.AmbientLight(0xffffff, 12.0); // mocniejsze ambient
      const hemi = new THREE.HemisphereLight(0xffffff, 0xccccff, 8.0); // mocniejsze hemisphere, jaśniejszy dół
      // Dodaj kilka DirectionalLight z różnych kierunków
      const dir1 = new THREE.DirectionalLight(0xffffff, 4.0);
      dir1.position.set(0, 10, 10);
      dir1.castShadow = false;
      const dir2 = new THREE.DirectionalLight(0xffffff, 3.0);
      dir2.position.set(10, 10, -10);
      dir2.castShadow = false;
      const dir3 = new THREE.DirectionalLight(0xffffff, 2.5);
      dir3.position.set(-10, 10, 10);
      dir3.castShadow = false;
      const dir4 = new THREE.DirectionalLight(0xffffff, 2.0);
      dir4.position.set(0, -10, -10);
      dir4.castShadow = false;
      // Dodaj piąte światło z przeciwnej strony (z tyłu kamery)
      const dir5 = new THREE.DirectionalLight(0xffffff, 3.5);
      dir5.position.set(0, 0, 15);
      dir5.castShadow = false;
      // Dodaj szóste światło z przeciwnej strony głównej ścieżki kamery (przód sceny)
      const dir6 = new THREE.DirectionalLight(0xffffff, 4.5);
      dir6.position.set(0, 0, -15);
      dir6.castShadow = false;
      // Zwiększ intensywność bocznych i tylnych świateł
      dir2.intensity = 4.5;
      dir3.intensity = 4.5;
      dir4.intensity = 3.5;
      dir5.intensity = 4.5;
      scene.add(ambient);
      scene.add(hemi);
      scene.add(dir1);
      scene.add(dir2);
      scene.add(dir3);
      scene.add(dir4);
      scene.add(dir5);
      scene.add(dir6);
      renderer.toneMappingExposure = 2.2;
      // Model info
      const modelInfos = [
        { name: "V.glb", position: [-0.002, 0, 0] },
        { name: "A.glb", position: [0.002, 0, -0.1] },
        { name: "Dot.glb", position: [0, 0, -0.2] },
        { name: "T.glb", position: [0, 0, 0.1] },
      ];
      const dotPosition = new THREE.Vector3();
      const modelPositions = [];
      let modelsLoaded = 0;
      const loader = new GLTFLoader();
      modelInfos.forEach(({ name, position }) => {
        loader.load(`/meshes/${name}`, (gltf) => {
          const model = gltf.scene;
          model.position.set(...position);
          modelPositions.push(model.position.clone());
          if (name === "Dot.glb") dotPosition.copy(model.position);
          model.traverse((child) => {
            if (child.isMesh) {
              // Wymuś jasny metaliczny materiał w fallbacku
              child.material = new THREE.MeshStandardMaterial({
                color: 0xe0e0e0,
                metalness: 1.0,
                roughness: 0.15,
                envMap: null,
                envMapIntensity: 0.0,
              });
              child.material.map = null;
              child.material.alphaMap = null;
              child.material.transparent = false;
              child.material.opacity = 1;
              child.material.colorWrite = true;
              child.material.visible = true;
              child.material.vertexColors = false;
              child.material.depthWrite = true;
              child.material.depthTest = true;
              child.material.side = THREE.DoubleSide;
              child.material.needsUpdate = true;
              child.castShadow = false;
              child.receiveShadow = false;
            }
          });
          scene.add(model);
          modelsLoaded++;
          if (modelsLoaded === modelInfos.length) {
            setFallbackLoading(false);
            // Animacja kamery i liter jak w oryginale
            const center = new THREE.Vector3();
            modelPositions.forEach((pos) => center.add(pos));
            center.divideScalar(modelPositions.length);
            let skewAngle = THREE.MathUtils.degToRad(startSkewDeg);
            const initialVerticalTilt =
              THREE.MathUtils.degToRad(startVerticalTiltDeg);
            const angleOffset =
              THREE.MathUtils.degToRad(startAngleDeg) + Math.PI;
            const angleDelta = THREE.MathUtils.degToRad(angleDeltaDeg);
            let verticalTiltDelta =
              THREE.MathUtils.degToRad(verticalTiltDeltaDeg);
            if (invertVertical) verticalTiltDelta = -verticalTiltDelta;
            function updateCameraPosition(
              angleRad,
              verticalTiltRad,
              extra = {}
            ) {
              let extraX = extra.x || 0;
              let extraY = extra.y || 0;
              let extraRoll = extra.roll || 0;
              const x = radius * Math.sin(angleRad) + extraX;
              const y = radius * Math.cos(verticalTiltRad) + extraY;
              const z = radius * Math.cos(angleRad);
              const camPos = new THREE.Vector3(
                center.x + x,
                center.y + y,
                center.z + z
              );
              camera.position.copy(camPos);
              const up = new THREE.Vector3(0, 1, 0);
              const lookAtMatrix = new THREE.Matrix4();
              lookAtMatrix.lookAt(camPos, center, up);
              const quat = new THREE.Quaternion();
              quat.setFromRotationMatrix(lookAtMatrix);
              if (extraRoll) {
                const rollQuat = new THREE.Quaternion();
                rollQuat.setFromAxisAngle(
                  new THREE.Vector3(0, 0, 1),
                  extraRoll
                );
                quat.multiply(rollQuat);
              }
              const skewQuat = new THREE.Quaternion();
              skewQuat.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -skewAngle);
              quat.multiply(skewQuat);
              camera.quaternion.copy(quat);
            }
            updateCameraPosition(-angleOffset, initialVerticalTilt);
            const orbit = {
              angle: -angleOffset,
              verticalTilt: initialVerticalTilt,
            };
            gsap.set(orbit, {
              angle: -angleOffset,
              verticalTilt: initialVerticalTilt,
            });
            gsap.to(orbit, {
              id: "camera-orbit-1",
              angle: -angleOffset - Math.PI * 1.1,
              verticalTilt: Math.PI / 2 + Math.PI * 0.1,
              scrollTrigger: {
                trigger: mount,
                start: "top top",
                end: "400%",
                scrub: true,
                onUpdate: (self) => {
                  let roll = 0;
                  const progress =
                    self && typeof self.progress === "number"
                      ? self.progress
                      : self &&
                        self.scrollTrigger &&
                        typeof self.scrollTrigger.progress === "number"
                      ? self.scrollTrigger.progress
                      : 0;
                  if (progress > 0.55) {
                    roll = -((progress - 0.55) / 0.45) * 0.35;
                  }
                  updateCameraPosition(orbit.angle, orbit.verticalTilt, {
                    roll,
                  });
                },
              },
              onUpdate: (self) => {
                let roll = 0;
                const progress =
                  self && typeof self.progress === "number"
                    ? self.progress
                    : self &&
                      self.scrollTrigger &&
                      typeof self.scrollTrigger.progress === "number"
                    ? self.scrollTrigger.progress
                    : 0;
                if (progress > 0.55) {
                  roll = -((progress - 0.55) / 0.45) * 0.35;
                }
                updateCameraPosition(orbit.angle, orbit.verticalTilt, { roll });
              },
              onComplete: () => {
                ScrollTrigger.refresh();
              },
            });
            let radiusObj = { value: getResponsiveRadius(startRadius) };
            gsap.to(radiusObj, {
              value: getResponsiveRadius(startRadius * 1.35),
              scrollTrigger: {
                trigger: mount,
                start: "180%",
                end: "400%",
                scrub: true,
              },
              ease: "power1.inOut",
              onUpdate: () => {
                radius = radiusObj.value;
              },
            });
            scene.children.forEach((child, i) => {
              if (child.isGroup || child.isMesh) {
                const origY = child.position.y;
                child.position.y = origY + 1;
                gsap.to(child.position, {
                  y: origY,
                  duration: 1.1,
                  delay: i * 0.08,
                  ease: "power2.out",
                });
              }
            });
            ScrollTrigger.refresh();
          }
        });
      });
      // Przywróć PNG jako tło w fallbacku
      const bgImg = new window.Image();
      bgImg.src = "/meshes/Grunge.png";
      bgImg.onload = () => {
        const bgTexture = new THREE.Texture(bgImg);
        bgTexture.needsUpdate = true;
        scene.background = bgTexture;
      };
      // Resize
      function handleResize() {
        if (!mount) return;
        camera.aspect = mount.clientWidth / mount.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        radius = getResponsiveRadius(startRadius);
        ScrollTrigger.refresh();
      }
      window.addEventListener("resize", handleResize);
      // Animacja
      const animate = () => {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
      };
      animate();
      return () => {
        window.removeEventListener("resize", handleResize);
        ScrollTrigger.getAll().forEach((st) => st.kill());
        renderer.dispose();
        // Usuń wszystkie dzieci mount po odmontowaniu
        while (mount.firstChild) {
          mount.removeChild(mount.firstChild);
        }
        mount.__threeInitialized = false;
      };
    }
    // eslint-disable-next-line
  }, [
    webgl2Supported,
    forceFallback,
    startAngleDeg,
    startVerticalTiltDeg,
    startRadius,
    startSkewDeg,
    angleDeltaDeg,
    verticalTiltDeltaDeg,
    invertVertical,
  ]);

  return (
    <div className="h-[400vh] w-full relative bg-black">
      <div className="sticky top-0 h-screen w-full" style={{ zIndex: 1 }}>
        {!webgl2Supported || forceFallback ? (
          <ThreeFallbackScene
            startAngleDeg={startAngleDeg}
            startVerticalTiltDeg={startVerticalTiltDeg}
            startRadius={startRadius}
            startSkewDeg={startSkewDeg}
            angleDeltaDeg={angleDeltaDeg}
            verticalTiltDeltaDeg={verticalTiltDeltaDeg}
            invertVertical={invertVertical}
            setFallbackLoading={setFallbackLoading}
            fallbackMountRef={fallbackMountRef}
          />
        ) : (
          <>
            {loading && <LoaderOverlay />}
            {/* Renderuj mountRef tylko jeśli webgl2Supported i nie fallback, i tylko raz */}
            {webgl2Supported && !forceFallback && (
              <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
            )}
          </>
        )}
        {/* Gradient bar at the bottom of the animation area */}
        <GradientBar />
        {/* Scroll button to section3, styled like navbar/section3 glitch button */}
        {scrollToSection && (
          <div
            style={{
              position: "absolute",
              zIndex: 30,
              bottom: 40,
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <GlitchButton
              onClick={() => scrollToSection("section3")}
              text={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-6 h-6 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
