"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
// import { sRGBEncoding } from "three";
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
    // window._fallbackScene = scene;
    const camera = new THREE.PerspectiveCamera(
      30,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100,
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    // Usuń WSZYSTKIE dzieci mount przed dodaniem nowego canvas
    while (mount.firstChild) {
      mount.removeChild(mount.firstChild);
    }
    mount.appendChild(renderer.domElement);
    // hide desktop canvas until models + prototypes are ready
    try {
      renderer.domElement.style.visibility = "hidden";
    } catch (e) {}

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
    // centroid of models (populated after models load)
    let sceneCenter = new THREE.Vector3();
    // ambientGroup will be created later; keep reference so we can position it relative to models
    let ambientGroup = null;
    // combined group for all particles (will replace ambient+interactive)
    let combinedGroup = null;
    // combined particles array (merged ambient + interactive)
    let combinedParticles = null;

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

          // If the particle prototype or particle groups already exist,
          // assign the new envMap so cloned GLB particles get proper HDR reflections.
          try {
            if (typeof particleProto !== "undefined" && particleProto)
              particleProto.traverse((c) => {
                if (c.isMesh && c.material) {
                  c.material.envMap = scene.environment;
                  c.material.envMapIntensity =
                    c.material.envMapIntensity || 1.0;
                  c.material.needsUpdate = true;
                }
              });
          } catch (e) {
            // particleProto may not be declared yet; ignore
          }
          try {
            if (
              typeof interactiveParticleProto !== "undefined" &&
              interactiveParticleProto
            )
              interactiveParticleProto.traverse((c) => {
                if (c.isMesh && c.material) {
                  c.material.envMap = scene.environment;
                  c.material.envMapIntensity =
                    c.material.envMapIntensity || 1.0;
                  c.material.needsUpdate = true;
                }
              });
          } catch (e) {
            // interactiveParticleProto may not be declared yet; ignore
          }

          try {
            if (combinedGroup) {
              combinedGroup.traverse((child) => {
                if (child.isMesh && child.material) {
                  child.material.envMap = scene.environment;
                  child.material.envMapIntensity =
                    child.material.envMapIntensity || 1.0;
                  child.material.needsUpdate = true;
                }
              });
            }
          } catch (e) {
            // combinedGroup may not exist yet
          }

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
                // don't hide loader yet — wait for particle prototypes
                const protosReady = !!(
                  particleProto ||
                  interactiveParticleProto ||
                  thirdParticleProto
                );
                if (protosReady) {
                  try {
                    createCombinedParticleGroups();
                  } catch (e) {}
                  setLoading(false);
                  try {
                    renderer.domElement.style.visibility = "visible";
                  } catch (e) {}
                } else {
                  // keep loader visible; canvas remains hidden until prototypes load
                  console.log(
                    "Models loaded; waiting for particle prototypes before showing scene",
                  );
                }

                // Calculate centroid of all models
                const center = new THREE.Vector3();
                modelPositions.forEach((pos) => center.add(pos));
                center.divideScalar(modelPositions.length);
                // store in outer-scoped sceneCenter for positioning particles/domes
                sceneCenter.copy(center);
                // if ambientGroup already exists, position it around the models' centroid
                try {
                  if (ambientGroup) ambientGroup.position.copy(sceneCenter);
                  // If interactive particles were created before models finished
                  // loading, shift their base positions so the spherical shell
                  // centers on the models' centroid.
                  try {
                    if (
                      typeof interactiveGroup !== "undefined" &&
                      interactiveGroup
                    )
                      interactiveGroup.children.forEach((c) =>
                        c.position.add(sceneCenter),
                      );
                    if (
                      typeof interactiveParticles !== "undefined" &&
                      interactiveParticles
                    )
                      interactiveParticles.forEach((ip) => {
                        if (ip.basePosition) ip.basePosition.add(sceneCenter);
                        if (ip.mesh) ip.mesh.position.add(sceneCenter);
                      });
                  } catch (e) {
                    // ignore if interactiveGroup/interactiveParticles not yet defined
                  }
                  // If HDR env is ready, assign it to particle materials so they get metallic reflections
                  if (scene.environment) {
                    [
                      ambientGroup,
                      typeof interactiveGroup !== "undefined"
                        ? interactiveGroup
                        : null,
                    ].forEach((g) => {
                      if (!g) return;
                      g.traverse((child) => {
                        if (child.isMesh && child.material) {
                          child.material.envMap = scene.environment;
                          child.material.needsUpdate = true;
                        }
                      });
                    });
                  }
                } catch (e) {
                  // ignore if ambientGroup not defined yet
                }

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
                    extra = {},
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
                      center.z + z,
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
                        extraRoll,
                      );
                      quat.multiply(rollQuat);
                    }
                    // Apply skew (roll) as before
                    const skewQuat = new THREE.Quaternion();
                    skewQuat.setFromAxisAngle(
                      new THREE.Vector3(0, 0, 1),
                      -skewAngle,
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
        },
      );

    // Usunięto poprzednie fioletowe tło shaderowe — zostaje tylko nowe tło (promień + particles)

    // === Spotlight w kolorze #6a00d1, przytwierdzony do kamery (pozycja zależna od kamery),
    // kierunek stały w stronę górnej części sceny ===
    const spotlight = new THREE.SpotLight(
      "#6a00d1",
      3.5,
      80,
      THREE.MathUtils.degToRad(32),
      0.85,
      1.0,
    );
    const spotlightTarget = new THREE.Object3D();
    spotlight.castShadow = false;
    spotlight.penumbra = 0.8;
    spotlight.decay = 1.0;
    // pozycję targetu ustawimy w pętli względem kamery
    spotlightTarget.position.set(0, 6, -2);
    scene.add(spotlightTarget);
    spotlight.target = spotlightTarget;
    scene.add(spotlight);

    // Billboardowa kolista poświata nad sceną (radial gradient #6a00d1)
    function createPurpleGlowTexture(size = 256) {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      const g = ctx.createRadialGradient(
        size / 2,
        size / 2,
        0,
        size / 2,
        size / 2,
        size / 2,
      );
      // Wzmocniony środek dla jaśniejszego, punktowego glow
      g.addColorStop(0.0, "rgba(106,0,209,0.85)");
      g.addColorStop(0.18, "rgba(106,0,209,0.55)");
      g.addColorStop(0.45, "rgba(106,0,209,0.30)");
      g.addColorStop(1.0, "rgba(106,0,209,0.0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.fill();
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      return tex;
    }
    const purpleGlowTex = createPurpleGlowTexture(256);
    const glowMat = new THREE.SpriteMaterial({
      map: purpleGlowTex,
      color: new THREE.Color("#ffffff"),
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 1.0,
      depthWrite: false,
    });
    const glowSprite = new THREE.Sprite(glowMat);
    // większa poświata (dalej powiększamy)
    glowSprite.scale.set(50.0, 50.0, 50.0);
    scene.add(glowSprite);
    let glowPulse = 0;

    // Volumetryczny stożek wizualizujący poświatę spotlightu (addytywny, subtelny)
    const volGeom = new THREE.ConeGeometry(1, 1, 48, 1, true);
    const volMat = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color("#6a00d1") },
        uOpacity: { value: 0.12 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main(){
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uOpacity;
        varying vec2 vUv;
        void main(){
          // pionowy zanik (mocniejszy bliżej źródła)
          float head = smoothstep(0.0, 0.25, vUv.y);
          float tail = 1.0 - vUv.y;
          float alpha = head * tail;
          // delikatna redukcja przy krawędziach szwu UV
          float seam = min(vUv.x, 1.0 - vUv.x);
          alpha *= smoothstep(0.0, 0.2, seam);
          gl_FragColor = vec4(uColor, alpha * uOpacity);
        }
      `,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      side: THREE.DoubleSide,
    });
    const volumetricCone = new THREE.Mesh(volGeom, volMat);
    scene.add(volumetricCone);

    // === Particles: ambient (around 50) using sprite ===
    // Tworzymy proceduralną teksturę sprite (okrąg z delikatnym halo)
    function createSpriteTexture(size = 64) {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      const g = ctx.createRadialGradient(
        size / 2,
        size / 2,
        0,
        size / 2,
        size / 2,
        size / 2,
      );
      // Sharper core and quicker falloff for less blur: stronger inner stop and tighter gradient
      g.addColorStop(0.0, "rgba(255,255,255,1.0)");
      g.addColorStop(0.18, "rgba(255,255,255,1.0)");
      g.addColorStop(0.35, "rgba(255,255,255,0.7)");
      g.addColorStop(1, "rgba(255,255,255,0.0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.fill();
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      return tex;
    }

    const spriteTextureSmall = createSpriteTexture(64);
    // larger texture for interactive particles to reduce blur at bigger scale
    const spriteTextureLarge = createSpriteTexture(128);

    // Load user's GLB particle prototypes: ambient (Particles_1) and interactive (Particles_2)
    let particleProto = null;
    let interactiveParticleProto = null;

    const particleLoader = new GLTFLoader();
    particleLoader.load(
      "/Particles_1 (2).glb",
      (gltf) => {
        particleProto = gltf.scene;
        // if HDR env already ready, assign envMap to proto materials
        if (scene.environment) {
          particleProto.traverse((c) => {
            if (c.isMesh && c.material) {
              c.material = new THREE.MeshStandardMaterial({
                color: c.material.color || new THREE.Color("#ffffff"),
                metalness: 1.0,
                roughness: 0.12,
                envMap: scene.environment,
                envMapIntensity: 1.2,
              });
            }
          });
        }
        // If combinedParticles already exist, replace meshes of typeIndex===0
        try {
          if (
            Array.isArray(combinedParticles) &&
            combinedParticles.length &&
            combinedGroup
          ) {
            combinedParticles.forEach((p) => {
              try {
                if (p.typeIndex !== 0) return;
                const old = p.mesh;
                const newInst = particleProto.clone(true);
                newInst.traverse((c) => {
                  if (c.isMesh) {
                    c.material = new THREE.MeshStandardMaterial({
                      color: new THREE.Color("#ffffff"),
                      metalness: 1.0,
                      roughness: 0.2,
                      envMap: scene.environment || null,
                      envMapIntensity: 1.0,
                    });
                    c.castShadow = false;
                    c.receiveShadow = false;
                  }
                });
                newInst.position.copy(old.position);
                newInst.scale.copy(old.scale);
                combinedGroup.remove(old);
                combinedGroup.add(newInst);
                p.mesh = newInst;
                p.basePosition = newInst.position.clone();
              } catch (e) {}
            });
          }
        } catch (e) {}
        // If models already loaded and particles not yet created, create them now
        try {
          if (modelsLoaded === modelInfos.length && !combinedParticles) {
            createCombinedParticleGroups();
            setLoading(false);
            try {
              renderer.domElement.style.visibility = "visible";
            } catch (e) {}
          }
        } catch (e) {}
      },
      undefined,
      (err) => {
        // load failed; keep particleProto null and fall back to simple meshes
        console.warn("Failed to load /Particles_1 (2).glb", err);
      },
    );

    // Interactive particles use a different GLB prototype when available
    const interactiveLoader = new GLTFLoader();
    interactiveLoader.load(
      "/Particles_2 (2).glb",
      (gltf) => {
        interactiveParticleProto = gltf.scene;
        if (scene.environment) {
          interactiveParticleProto.traverse((c) => {
            if (c.isMesh && c.material) {
              c.material = new THREE.MeshStandardMaterial({
                color: c.material.color || new THREE.Color("#ffffff"),
                metalness: 1.0,
                roughness: 0.06,
                envMap: scene.environment,
                envMapIntensity: 1.6,
              });
            }
          });
        }
        // Replace meshes of this type (typeIndex===1) if combinedParticles already exist
        try {
          if (
            Array.isArray(combinedParticles) &&
            combinedParticles.length &&
            combinedGroup
          ) {
            combinedParticles.forEach((p) => {
              try {
                if (p.typeIndex !== 1) return;
                const old = p.mesh;
                const newInst = interactiveParticleProto.clone(true);
                newInst.traverse((c) => {
                  if (c.isMesh) {
                    c.material = new THREE.MeshStandardMaterial({
                      color: new THREE.Color("#ffffff"),
                      metalness: 1.0,
                      roughness: 0.06,
                      envMap: scene.environment || null,
                      envMapIntensity: 1.6,
                    });
                    c.castShadow = false;
                    c.receiveShadow = false;
                  }
                });
                newInst.position.copy(old.position);
                newInst.scale.copy(old.scale);
                combinedGroup.remove(old);
                combinedGroup.add(newInst);
                p.mesh = newInst;
                p.basePosition = newInst.position.clone();
              } catch (e) {}
            });
          }
        } catch (e) {}
        try {
          if (modelsLoaded === modelInfos.length && !combinedParticles) {
            createCombinedParticleGroups();
            setLoading(false);
            try {
              renderer.domElement.style.visibility = "visible";
            } catch (e) {}
          }
        } catch (e) {}
      },
      undefined,
      (err) => {
        console.warn("Failed to load /Particles_2 (2).glb", err);
      },
    );

    // Load third prototype for variety
    let thirdParticleProto = null;
    const thirdLoader = new GLTFLoader();
    thirdLoader.load(
      "/Particles_3 (2).glb",
      (gltf) => {
        thirdParticleProto = gltf.scene;
        if (scene.environment) {
          thirdParticleProto.traverse((c) => {
            if (c.isMesh && c.material) {
              c.material = new THREE.MeshStandardMaterial({
                color: c.material.color || new THREE.Color("#ffffff"),
                metalness: 1.0,
                roughness: 0.12,
                envMap: scene.environment,
                envMapIntensity: 1.1,
              });
            }
          });
        }
        // Replace meshes of this type (typeIndex===2) if combinedParticles already exist
        try {
          if (
            Array.isArray(combinedParticles) &&
            combinedParticles.length &&
            combinedGroup
          ) {
            combinedParticles.forEach((p) => {
              try {
                if (p.typeIndex !== 2) return;
                const old = p.mesh;
                const newInst = thirdParticleProto.clone(true);
                newInst.traverse((c) => {
                  if (c.isMesh) {
                    c.material = new THREE.MeshStandardMaterial({
                      color: new THREE.Color("#ffffff"),
                      metalness: 1.0,
                      roughness: 0.12,
                      envMap: scene.environment || null,
                      envMapIntensity: 1.1,
                    });
                    c.castShadow = false;
                    c.receiveShadow = false;
                  }
                });
                newInst.position.copy(old.position);
                newInst.scale.copy(old.scale);
                combinedGroup.remove(old);
                combinedGroup.add(newInst);
                p.mesh = newInst;
                p.basePosition = newInst.position.clone();
              } catch (e) {}
            });
          }
        } catch (e) {}
        try {
          if (modelsLoaded === modelInfos.length && !combinedParticles) {
            createCombinedParticleGroups();
            setLoading(false);
            try {
              renderer.domElement.style.visibility = "visible";
            } catch (e) {}
          }
        } catch (e) {}
      },
      undefined,
      (err) => {
        console.warn("Failed to load /Particles_3 (2).glb", err);
      },
    );

    function createCombinedParticleGroups() {
      // This function creates ambient + interactive particle groups using
      // available GLB prototypes. It intentionally does NOT create primitive
      // fallback meshes — the loader will remain visible until prototypes
      // and models are ready.
      try {
        // Increase ambient particle count for denser dome (doubled)
        const ambientCount = 360;
        ambientGroup = new THREE.Group();
        const ambientParticles = [];
        if (particleProto) {
          for (let i = 0; i < ambientCount; i++) {
            const r = 30 + Math.random() * 40;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random());
            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.cos(phi);
            const z = r * Math.sin(phi) * Math.sin(theta);
            const zJitter = 20;
            const zRand = (Math.random() - 0.5) * zJitter;
            let baseScale = 0.12 + Math.random() * 0.6;
            const inst = particleProto.clone(true);
            inst.traverse((c) => {
              if (c.isMesh) {
                c.material = new THREE.MeshStandardMaterial({
                  color: new THREE.Color("#ffffff"),
                  metalness: 1.0,
                  roughness: 0.2,
                  envMap: scene.environment || null,
                  envMapIntensity: 1.0,
                });
                c.castShadow = false;
                c.receiveShadow = false;
              }
            });
            inst.position.set(x, y, z + zRand);
            inst.scale.set(baseScale, baseScale, baseScale);
            const ambObj = {
              mesh: inst,
              basePosition: inst.position.clone(),
              typeIndex: 0,
              amp: new THREE.Vector3(
                0.28 + Math.random() * 1.2,
                0.16 + Math.random() * 0.7,
                0.28 + Math.random() * 1.2,
              ),
              freqX: 0.12 + Math.random() * 0.5,
              freqY: 0.1 + Math.random() * 0.4,
              freqZ: 0.12 + Math.random() * 0.5,
              phaseX: Math.random() * Math.PI * 2,
              phaseY: Math.random() * Math.PI * 2,
              phaseZ: Math.random() * Math.PI * 2,
              wobbleDir: new THREE.Vector3(
                Math.random() * 2 - 1,
                Math.random() * 2 - 1,
                Math.random() * 2 - 1,
              ).normalize(),
              baseScale,
              pulseNext: Math.random() * 6 + 1,
              pulseDuration: 0.6 + Math.random() * 1.2,
              pulseAmp: 0.06 + Math.random() * 0.24,
              pulsing: false,
              pulseStart: 0,
              initFacingOffset: new THREE.Quaternion().setFromEuler(
                new THREE.Euler(
                  THREE.MathUtils.degToRad(Math.random() * 40 - 20),
                  THREE.MathUtils.degToRad(Math.random() * 40 - 20),
                  Math.random() * Math.PI * 2,
                ),
              ),
            };
            ambientParticles.push(ambObj);
            ambientGroup.add(inst);
          }
          scene.add(ambientGroup);
        }

        // Interactive particles
        const interactiveCount = 200;
        let interactiveGroup = new THREE.Group();
        const interactiveParticles = [];
        const preferredProto =
          interactiveParticleProto ||
          particleProto ||
          thirdParticleProto ||
          null;
        if (preferredProto) {
          for (let i = 0; i < interactiveCount; i++) {
            const r = 30 + Math.random() * 40;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.cos(phi);
            const z = r * Math.sin(phi) * Math.sin(theta);
            const inst = preferredProto.clone(true);
            inst.traverse((c) => {
              if (c.isMesh) {
                const baseColor =
                  (c.material && c.material.color) ||
                  new THREE.Color("#ffffff");
                const isInteractiveProto =
                  preferredProto === interactiveParticleProto;
                const isThirdProto = preferredProto === thirdParticleProto;
                c.material = new THREE.MeshStandardMaterial({
                  color: baseColor,
                  metalness: 1.0,
                  roughness: isInteractiveProto
                    ? 0.06
                    : isThirdProto
                      ? 0.12
                      : 0.08,
                  envMap: scene.environment || null,
                  envMapIntensity: isInteractiveProto
                    ? 1.6
                    : isThirdProto
                      ? 1.1
                      : 1.0,
                });
                c.castShadow = false;
                c.receiveShadow = false;
              }
            });
            inst.position.set(x, y, z);
            let baseScale = 0.36 + Math.random() * 3.96;
            inst.scale.set(baseScale, baseScale, baseScale);
            const intObj = {
              mesh: inst,
              basePosition: inst.position.clone(),
              baseScale,
              typeIndex: 1,
              amp: new THREE.Vector3(
                (0.4 + Math.random() * 1.2) * 0.1,
                (0.18 + Math.random() * 0.8) * 0.1,
                (0.4 + Math.random() * 1.2) * 0.1,
              ),
              freqX: (0.16 + Math.random() * 0.7) * 0.1,
              freqY: (0.12 + Math.random() * 0.6) * 0.1,
              freqZ: (0.16 + Math.random() * 0.7) * 0.1,
              phaseX: Math.random() * Math.PI * 2,
              phaseY: Math.random() * Math.PI * 2,
              phaseZ: Math.random() * Math.PI * 2,
              wobbleDir: new THREE.Vector3(
                Math.random() * 2 - 1,
                Math.random() * 2 - 1,
                Math.random() * 2 - 1,
              ).normalize(),
              pulseNext: Math.random() * 5 + 0.8,
              pulseDuration: 0.7 + Math.random() * 1.2,
              pulseAmp: 0.08 + Math.random() * 0.22,
              pulsing: false,
              pulseStart: 0,
              initFacingOffset: new THREE.Quaternion().setFromEuler(
                new THREE.Euler(
                  THREE.MathUtils.degToRad(Math.random() * 40 - 20),
                  THREE.MathUtils.degToRad(Math.random() * 40 - 20),
                  Math.random() * Math.PI * 2,
                ),
              ),
            };
            interactiveParticles.push(intObj);
            interactiveGroup.add(inst);
          }
          scene.add(interactiveGroup);
        }

        // Merge groups
        try {
          combinedGroup = new THREE.Group();
          if (ambientGroup) {
            ambientGroup.children.slice().forEach((c) => {
              ambientGroup.remove(c);
              combinedGroup.add(c);
            });
          }
          if (interactiveGroup) {
            interactiveGroup.children.slice().forEach((c) => {
              interactiveGroup.remove(c);
              combinedGroup.add(c);
            });
          }
          combinedParticles = [];
          if (
            typeof ambientParticles !== "undefined" &&
            Array.isArray(ambientParticles)
          )
            combinedParticles.push(...ambientParticles);
          if (
            typeof interactiveParticles !== "undefined" &&
            Array.isArray(interactiveParticles)
          )
            combinedParticles.push(...interactiveParticles);
          scene.add(combinedGroup);
          try {
            scene.remove(ambientGroup);
          } catch (e) {}
          try {
            scene.remove(interactiveGroup);
          } catch (e) {}
          ambientGroup = null;
          interactiveGroup = null;
        } catch (e) {
          console.warn("Failed to merge particle groups:", e);
        }

        // Size adjustments and fill to DESIRED_COUNT
        try {
          const DESIRED_COUNT = 400;
          const MIN_BASE_SCALE = 3.0;
          if (Array.isArray(combinedParticles)) {
            combinedParticles.forEach((p) => {
              try {
                p.baseScale = Math.max((p.baseScale || 1) * 5, MIN_BASE_SCALE);
                if (p.mesh)
                  p.mesh.scale.set(p.baseScale, p.baseScale, p.baseScale);
              } catch (e) {}
            });
            function makeParticleInstance() {
              const r = 30 + Math.random() * 40;
              const theta = Math.random() * Math.PI * 2;
              const phi = Math.acos(2 * Math.random() - 1);
              const x = r * Math.sin(phi) * Math.cos(theta);
              const y = r * Math.cos(phi);
              const z = r * Math.sin(phi) * Math.sin(theta);
              const typeIndex = Math.floor(Math.random() * 3);
              const proto =
                typeIndex === 1
                  ? interactiveParticleProto ||
                    particleProto ||
                    thirdParticleProto
                  : typeIndex === 2
                    ? thirdParticleProto ||
                      particleProto ||
                      interactiveParticleProto
                    : particleProto ||
                      interactiveParticleProto ||
                      thirdParticleProto;
              if (!proto) return null;
              const inst = proto.clone(true);
              inst.traverse((c) => {
                if (c.isMesh) {
                  c.material = new THREE.MeshStandardMaterial({
                    color:
                      (c.material && c.material.color) ||
                      new THREE.Color("#ffffff"),
                    metalness: 1.0,
                    roughness:
                      typeIndex === 1 ? 0.06 : typeIndex === 2 ? 0.12 : 0.2,
                    envMap: scene.environment || null,
                    envMapIntensity:
                      typeIndex === 1 ? 1.6 : typeIndex === 2 ? 1.1 : 1.0,
                  });
                  c.castShadow = false;
                  c.receiveShadow = false;
                }
              });
              inst.position.set(x, y, z);
              const baseScale = Math.max(
                (0.36 + Math.random() * 3.96) * 5,
                MIN_BASE_SCALE,
              );
              inst.scale.set(baseScale, baseScale, baseScale);
              return {
                mesh: inst,
                basePosition: inst.position.clone(),
                baseScale,
                typeIndex,
                amp: new THREE.Vector3(
                  (0.4 + Math.random() * 1.2) * 0.1,
                  (0.18 + Math.random() * 0.8) * 0.1,
                  (0.4 + Math.random() * 1.2) * 0.1,
                ),
                freqX: (0.16 + Math.random() * 0.7) * 0.1,
                freqY: (0.12 + Math.random() * 0.6) * 0.1,
                freqZ: (0.16 + Math.random() * 0.7) * 0.1,
                phaseX: Math.random() * Math.PI * 2,
                phaseY: Math.random() * Math.PI * 2,
                phaseZ: Math.random() * Math.PI * 2,
                wobbleDir: new THREE.Vector3(
                  Math.random() * 2 - 1,
                  Math.random() * 2 - 1,
                  Math.random() * 2 - 1,
                ).normalize(),
                pulseNext: Math.random() * 5 + 0.8,
                pulseDuration: 0.7 + Math.random() * 1.2,
                pulseAmp: 0.08 + Math.random() * 0.22,
                pulsing: false,
                pulseStart: 0,
                initFacingOffset: new THREE.Quaternion().setFromEuler(
                  new THREE.Euler(
                    THREE.MathUtils.degToRad(Math.random() * 40 - 20),
                    THREE.MathUtils.degToRad(Math.random() * 40 - 20),
                    Math.random() * Math.PI * 2,
                  ),
                ),
              };
            }
            while (combinedParticles.length < DESIRED_COUNT) {
              try {
                const np = makeParticleInstance();
                if (!np) break;
                combinedParticles.push(np);
                if (combinedGroup && np.mesh) combinedGroup.add(np.mesh);
              } catch (e) {
                break;
              }
            }
          }
        } catch (e) {
          console.warn("Failed to adjust combined particles:", e);
        }
      } catch (e) {
        console.warn("createCombinedParticleGroups failed:", e);
      }
    }

    // Sphere rotation state (smoothed)
    const sphereRotation = {
      currentYaw: 0,
      currentPitch: 0,
      targetYaw: 0,
      targetPitch: 0,
    };
    // normalized mouse position (-1..1)
    const mouseNorm = new THREE.Vector2(0, 0);
    // previous normalized mouse (kept for potential speed measurement if needed)
    // not used to apply immediate deltas — we set target from absolute mouse
    // position and animate toward it with easing.
    const prevMouseNorm = new THREE.Vector2(0, 0);
    // Quaternion offset to rotate particle prototype so its "front" faces camera.
    // Adjust the Euler here if a different axis needs +90° rotation.
    const particleFacingOffset = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(Math.PI / 2, 0, 0),
    );
    // Max yaw: reduce dramatically (80% smaller than previous) so full-edge
    // pointer produces only a very small rotation. Previously ~63°; now 20%
    // of that -> PI*0.07 (~12.6°).
    // Make mouse-driven rotation barely visible by reducing max angles
    const MAX_YAW = Math.PI * 0.01; // ~1.8° max yaw (very small)
    const MAX_PITCH = Math.PI * 0.03; // ~5.4° max pitch (small)

    // === Mouse influence ===
    const mouse = new THREE.Vector2(0, 0);
    const mouseWorld = new THREE.Vector3();
    const raycaster = new THREE.Raycaster();
    const mousePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0); // płaszczyzna Z=0
    function onMouseMove(e) {
      const rect = renderer.domElement.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      // update shared mouse for raycasting use
      mouse.x = normX;
      mouse.y = normY;
      raycaster.setFromCamera(mouse, camera);
      raycaster.ray.intersectPlane(mousePlane, mouseWorld);

      // Set normalized mouse state (authoritative). We set the target
      // rotation from the absolute pointer position; animate() will smooth
      // toward this target with an ease-in/out. This ensures movement
      // duration matches user interaction while still easing at start/end.
      mouseNorm.x = Math.max(-1, Math.min(1, normX));
      mouseNorm.y = Math.max(-1, Math.min(1, normY));
      sphereRotation.targetYaw = mouseNorm.x * MAX_YAW;
      sphereRotation.targetPitch = mouseNorm.y * MAX_PITCH;
      // store previous (for optional speed calculations)
      prevMouseNorm.x = mouseNorm.x;
      prevMouseNorm.y = mouseNorm.y;
    }
    renderer.domElement.addEventListener("mousemove", onMouseMove);

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
      const t = performance.now() * 0.001;
      // Spotlight: pozycja przy kamerze bez wpływu rotacji (offset w osi świata)
      const lightWorldPos = camera.position
        .clone()
        .add(new THREE.Vector3(0, 0.8, 0.2));
      spotlight.position.copy(lightWorldPos);
      // Cel: przed kamerą w kierunku patrzenia + lekko do góry
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      const targetWorld = camera.position
        .clone()
        .add(forward.multiplyScalar(8))
        .add(new THREE.Vector3(0, 2.5, 0));
      spotlightTarget.position.copy(targetWorld);
      spotlightTarget.updateMatrixWorld();

      // Kolista poświata: billboardowy sprite ustawiony w górnej części sceny
      // Znacznie wyżej ponad górną krawędzią sceny i nieco dalej przed kamerą
      const glowPos = camera.position
        .clone()
        .add(forward.clone().multiplyScalar(7))
        .add(new THREE.Vector3(0, 22.0, 0));
      glowSprite.position.copy(glowPos);
      glowSprite.quaternion.copy(camera.quaternion);
      glowPulse += 0.012;
      // Jeszcze jaśniejsza poświata - texture ma silniejszy środek; utrzymujemy opacity na maksimum
      let base = 1.0;
      let pulse = Math.sin(glowPulse) * 0.06;
      glowMat.opacity = Math.min(1.0, base + pulse);

      // (Ambient loop removed) ambient + interactive are merged into combinedParticles

      // Interactive particles placed on a spherical shell. We rotate the
      // entire shell toward the mouse by building a quaternion from a
      // smoothed yaw/pitch derived from the normalized mouse and applying
      // it to each particle's base world position.
      // Update sphereRotation targets based on normalized mouse (-1..1)
      // targetYaw/targetPitch are set on mousemove handler (directional step);
      // do not override them here so the shell holds after movement.
      // Slower base smoothing (twice slower than previous). Apply an
      // ease-in-out factor based on how far we are from the target so the
      // motion accelerates when starting and decelerates near the target.
      // Smooth toward the target with an ease-in/out whose speed scales
      // with the distance to target. This keeps rotation duration roughly
      // proportional to how far the mouse moved while providing a pleasant
      // ease in/out at the start and end of the motion.
      const yawTarget = sphereRotation.targetYaw;
      const pitchTarget = sphereRotation.targetPitch;
      const yawDiff2 = yawTarget - sphereRotation.currentYaw;
      const pitchDiff2 = pitchTarget - sphereRotation.currentPitch;
      // normalized distance 0..1
      const yawNorm2 = Math.min(1, Math.abs(yawDiff2) / MAX_YAW);
      const pitchNorm2 = Math.min(1, Math.abs(pitchDiff2) / MAX_PITCH);
      // ease-in-out curve (cosine) applied to normalized distance
      const yawEase2 = 0.5 - 0.5 * Math.cos(yawNorm2 * Math.PI);
      const pitchEase2 = 0.5 - 0.5 * Math.cos(pitchNorm2 * Math.PI);
      // dynamic lerp factor: base speed plus extra proportional to distance
      // slowed down by another 50% per request (smaller overall motion).
      const BASE_SPEED = 0.0045; // slowed 5x
      const EXTRA_SPEED = 0.09; // slowed 5x
      // increase ease-in effect by applying a bias to the ease curve.
      // IN_BIAS < 1 amplifies the early portion of the ease (stronger in).
      const IN_BIAS = 0.5;
      const yawEaseIn = Math.pow(yawEase2, IN_BIAS);
      const pitchEaseIn = Math.pow(pitchEase2, IN_BIAS);
      const yawLerp = Math.min(
        1,
        (BASE_SPEED + EXTRA_SPEED * yawNorm2) * yawEaseIn,
      );
      const pitchLerp = Math.min(
        1,
        (BASE_SPEED + EXTRA_SPEED * pitchNorm2) * pitchEaseIn,
      );
      sphereRotation.currentYaw = THREE.MathUtils.lerp(
        sphereRotation.currentYaw,
        yawTarget,
        yawLerp,
      );
      sphereRotation.currentPitch = THREE.MathUtils.lerp(
        sphereRotation.currentPitch,
        pitchTarget,
        pitchLerp,
      );
      // hard clamp to allowed range
      sphereRotation.currentYaw = Math.max(
        -MAX_YAW,
        Math.min(MAX_YAW, sphereRotation.currentYaw),
      );
      sphereRotation.currentPitch = Math.max(
        -MAX_PITCH,
        Math.min(MAX_PITCH, sphereRotation.currentPitch),
      );

      // build quaternion (rotate Y then X)
      const euler = new THREE.Euler(
        sphereRotation.currentPitch,
        sphereRotation.currentYaw,
        0,
        "YXZ",
      );
      const rotQuat = new THREE.Quaternion().setFromEuler(euler);

      const centerVec = sceneCenter
        ? sceneCenter.clone()
        : new THREE.Vector3(0, 0, 0);
      // Unified particle loop: apply sphere rotation + autonomous wobble + pulsing
      const allParticles = Array.isArray(combinedParticles)
        ? combinedParticles
        : [];
      for (const p of allParticles) {
        // per-axis independent wobble
        const wx = Math.sin(t * p.freqX + p.phaseX) * (p.amp ? p.amp.x : 0);
        const wy = Math.cos(t * p.freqY + p.phaseY) * (p.amp ? p.amp.y : 0);
        const wz = Math.sin(t * p.freqZ + p.phaseZ) * (p.amp ? p.amp.z : 0);
        const iox = (p.wobbleDir ? p.wobbleDir.x : 0) * wx;
        const ioy = (p.wobbleDir ? p.wobbleDir.y : 0) * wy;
        const ioz = (p.wobbleDir ? p.wobbleDir.z : 0) * wz;

        const rel = p.basePosition.clone().sub(centerVec);
        const rotated = rel.applyQuaternion(rotQuat);
        const final = rotated
          .add(new THREE.Vector3(iox, ioy, ioz))
          .add(centerVec);

        if (p.mesh) {
          p.mesh.position.copy(final);
          try {
            p.mesh.quaternion.copy(camera.quaternion);
            p.mesh.quaternion.multiply(particleFacingOffset);
            if (p.initFacingOffset)
              p.mesh.quaternion.multiply(p.initFacingOffset);
          } catch (e) {}

          // pulsing
          const now = t;
          if (!p.pulsing && now >= (p.pulseNext || 0)) {
            p.pulsing = true;
            p.pulseStart = now;
            p.pulseEnd = now + (p.pulseDuration || 1.0);
          }
          let newScale = p.baseScale || 1;
          if (p.pulsing) {
            const pr = Math.max(
              0,
              Math.min(1, (now - p.pulseStart) / (p.pulseDuration || 1.0)),
            );
            if (pr >= 1) {
              p.pulsing = false;
              p.pulseNext = now + 2 + Math.random() * 6;
            } else {
              const ease = 0.5 - 0.5 * Math.cos(pr * Math.PI * 2);
              newScale = (p.baseScale || 1) * (1 + (p.pulseAmp || 0.12) * ease);
            }
          }
          p.mesh.scale.set(newScale, newScale, newScale);
          // clamp
          const distFromCenter = new THREE.Vector3()
            .subVectors(p.mesh.position, centerVec)
            .length();
          if (distFromCenter > 200) {
            const dir = p.mesh.position.clone().sub(centerVec).normalize();
            p.mesh.position.copy(
              centerVec.clone().add(dir.multiplyScalar(200)),
            );
          }
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      ScrollTrigger.getAll().forEach((st) => st.kill());
      renderer.dispose();
      renderer.domElement.removeEventListener("mousemove", onMouseMove);
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
  //   useEffect(() => {
  //     if (!webgl2Supported || forceFallback) {
  //       setShowStaticBg(false);
  //       const timeout = setTimeout(() => setShowStaticBg(true), 2000);
  //       return () => clearTimeout(timeout);
  //     }
  //   }, [webgl2Supported, forceFallback]);

  // Fallback: uproszczona scena 3D na statycznym tle
  // ...usunięto logikę fallbacku, całość obsługuje ThreeFallbackScene...

  return (
    <div className="h-[400vh] w-full relative bg-[#080808] z-0">
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
                  className="w-6 h-6 text-[#f2f2f2]"
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
