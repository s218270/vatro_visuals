"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Funkcja detekcji iOS/mobilnych urządzeń
function isIOS() {
  if (typeof window === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.userAgent.includes("Mac") && "ontouchend" in document);
}
function isMobile() {
  if (typeof window === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

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
  const [forceFallback, setForceFallback] = useState(false);

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

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
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

    // --- USUŃ PEŁNOEKRANOWY QUAD Z ANIMOWANYM SHADEREM ---
    // (bgScene, bgCamera, uniforms, bgMaterial, bgQuad, renderer.render(bgScene, bgCamera), uniforms.iTime.value)
    // --- ZOSTAW TYLKO PROCEDURALNY SKYBOX NA SFERZE ---
    // --- PROCEDURALNA CUBEMAPA Z SHADEREM ---
    // Dynamiczne limity
    let cubeRes = 4096;
    let STEP = 256;
    if (isIOS() || isMobile()) {
      cubeRes = 1024;
      STEP = 64;
    } else if (typeof window !== "undefined") {
      // Sprawdź limity GPU
      try {
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl2");
        if (gl) {
          const maxCube = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);
          if (maxCube < 4096) cubeRes = maxCube;
        }
      } catch {}
    }
    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(cubeRes, {
      type: THREE.HalfFloatType,
    });
    const cubeCameras = [];
    const directions = [
      { dir: [1, 0, 0], up: [0, -1, 0] }, // posX
      { dir: [-1, 0, 0], up: [0, -1, 0] }, // negX
      { dir: [0, 1, 0], up: [0, 0, 1] }, // posY
      { dir: [0, -1, 0], up: [0, 0, -1] }, // negY
      { dir: [0, 0, 1], up: [0, -1, 0] }, // posZ
      { dir: [0, 0, -1], up: [0, -1, 0] }, // negZ
    ];
    for (let i = 0; i < 6; i++) {
      const cam = new THREE.PerspectiveCamera(90, 1, 0.1, 10);
      cam.position.set(0, 0, 0);
      cam.up.set(...directions[i].up);
      cam.lookAt(...directions[i].dir);
      cubeCameras.push(cam);
    }
    const quadScene = new THREE.Scene();
    const quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const quadMaterial = new THREE.ShaderMaterial({
      uniforms: {
        iResolution: { value: new THREE.Vector3(cubeRes, cubeRes, 1) },
        faceIndex: { value: 0 },
        uScroll: { value: 0 },
        STEP: { value: STEP },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        #define EPS .001
        uniform vec3 iResolution;
        uniform float uScroll;
        uniform int faceIndex;
        uniform int STEP;
        varying vec2 vUv;
        float smin( float a, float b, float k ) {
            float h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 );
            return mix( b, a, h ) - k*h*(1.0-h);
        }
        const mat2 m = mat2(.8,.6,-.6,.8);
        float noise( in vec2 x ) {
            return sin(1.5*x.x)*sin(1.5*x.y);
        }
        float fbm6( vec2 p ) {
            float f = 0.0;
            f += 0.500000*(0.5+0.5*noise( p )); p = m*p*2.02;
            f += 0.250000*(0.5+0.5*noise( p )); p = m*p*2.03;
            f += 0.125000*(0.5+0.5*noise( p )); p = m*p*2.01;
            f += 0.062500*(0.5+0.5*noise( p )); p = m*p*2.04;
            f += 0.015625*(0.5+0.5*noise( p ));
            return f/0.96875;
        }
        mat2 getRot(float a) {
            float sa = sin(a), ca = cos(a);
            return mat2(ca,-sa,sa,ca);
        }
        vec3 _position;
        float sphere(vec3 center, float radius) {
            return distance(_position,center) - radius;
        }
        float swingPlane(float height) {
            vec3 pos = _position + vec3(0.,0.,uScroll * 2.5);
            float def =  fbm6(pos.xz * .25) * 1.;
            float way = pow(abs(pos.x) * 34. ,2.5) *.0000125;
            def *= way;
            float ch = height + def;
            return max(pos.y - ch,0.);
        }
        float map(vec3 pos) {
            _position = pos;
            float dist;
            dist = swingPlane(0.);
            float sminFactor = 5.25;
            dist = smin(dist,sphere(vec3(0.,-15.,80.),45.),sminFactor);
            return dist;
        }
        vec3 getNormal(vec3 pos) {
            vec3 nor = vec3(0.);
            vec3 vv = vec3(0.,1.,-1.)*.01;
            nor.x = map(pos + vv.zxx) - map(pos + vv.yxx);
            nor.y = map(pos + vv.xzx) - map(pos + vv.xyx);
            nor.z = map(pos + vv.xxz) - map(pos + vv.xxy);
            nor /= 2.;
            return normalize(nor);
        }
        // Cubemap ray direction
        vec3 getRayDir(vec2 uv, int face) {
          uv = uv * 2.0 - 1.0;
          if(face==0) return normalize(vec3( 1.0, -uv.y, -uv.x)); // posX
          if(face==1) return normalize(vec3(-1.0, -uv.y,  uv.x)); // negX
          if(face==2) return normalize(vec3( uv.x,  1.0,  uv.y)); // posY
          if(face==3) return normalize(vec3( uv.x, -1.0, -uv.y)); // negY
          if(face==4) return normalize(vec3( uv.x, -uv.y,  1.0)); // posZ
          return         normalize(vec3(-uv.x, -uv.y, -1.0));     // negZ
        }
        void main() {
            vec2 fragCoord = vUv * iResolution.xy;
            vec2 uv = (fragCoord.xy-.5*iResolution.xy)/iResolution.y;
            // Cubemap ray direction
            vec3 rayDir = getRayDir(vUv, faceIndex);
            // Camera setup
            vec3 rayOrigin = vec3(uv + vec2(0.,6.), -1. );
            // Blend cubemap direction with original shader direction for seamlessness
            vec3 rd = normalize(mix(normalize(vec3(uv,1.)), rayDir, 0.7));
            rd.zy = getRot(.05) * rd.zy;
            rd.xy = getRot(.075) * rd.xy;
            vec3 position = rayOrigin;
            float curDist;
            int nbStep = 0;
            for(; nbStep < STEP;++nbStep) {
                curDist = map(position);
                if(curDist < EPS)
                    break;
                position += rd * curDist * .5;
            }
            float f;
            float dist = distance(rayOrigin,position);
            f = dist /(98.);
            f = float(nbStep) / float(STEP);
            f *= .8;
            vec3 col = vec3(f);
            // Darken: gamma correction and scale
            col = pow(col, vec3(2.2));
            col *= 0.5;
            gl_FragColor = vec4(col,1.0);
        }
      `,
      depthWrite: false,
      depthTest: false,
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), quadMaterial);
    quadScene.add(quad);
    for (let i = 0; i < 6; i++) {
      quadMaterial.uniforms.faceIndex.value = i;
      renderer.setRenderTarget(cubeRenderTarget, i);
      renderer.render(quadScene, quadCamera);
    }
    renderer.setRenderTarget(null);
    scene.background = cubeRenderTarget.texture;

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
      mount.removeChild(renderer.domElement);
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
  if (!webgl2Supported || forceFallback) {
    // Na iOS: loader zamiast webm
    if (isIOS()) {
      return (
        <div className="h-[400vh] w-full relative bg-black">
          <div className="sticky top-0 h-screen w-full flex items-center justify-center" style={{ zIndex: 1 }}>
            <div className="flex flex-col items-center justify-center w-full h-full">
              <div className="flex items-center justify-center w-full h-full z-20">
                <div style={{ width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="loader-ios" style={{ width: 64, height: 64, border: '6px solid #a259f7', borderTop: '6px solid #fff', borderRadius: '50%', animation: 'spin 1.2s linear infinite' }} />
                  <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    // Pozostałe urządzenia: statyczny obrazek
    return (
      <div className="h-[400vh] w-full relative bg-black">
        <div className="sticky top-0 h-screen w-full" style={{ zIndex: 1 }}>
          <img
            src="/meshes/Grunge.png"
            alt="Background"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 0,
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-[400vh] w-full relative bg-black">
      {/* Loader overlay (only over animation, not full screen) */}
      <div className="sticky top-0 h-screen w-full" style={{ zIndex: 1 }}>
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black bg-opacity-90 pointer-events-auto">
            <video
              src="/Loading_WWW.webm"
              autoPlay
              loop
              muted
              style={{
                width: 120,
                height: 120,
                objectFit: "contain",
                animation: "spin 1.2s linear infinite",
              }}
            />
            <style>{`
              @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
          </div>
        )}
        <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
        {/* Gradient bar at the bottom of the animation area */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: "30vh",
            pointerEvents: "none",
            zIndex: 10, // below scroll button
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0) 0%, #000 100%)",
          }}
        />
        {/* Scroll button to section3, styled like navbar/section3 glitch button */}
        {scrollToSection && (
          <div
            className="button-border-wrapper"
            style={{
              position: "absolute",
              zIndex: 30,
              bottom: 40,
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <button
              onClick={() => {
                const section = document.getElementById("section3");
                if (section) {
                  section.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                  // Repeatedly correct scroll position until section3 is at the top (minus nav)
                  let attempts = 0;
                  const maxAttempts = 16; // ~500ms at 60fps
                  function correctScroll() {
                    const nav = document.querySelector("nav");
                    const navHeight = nav ? nav.offsetHeight : 0;
                    const rect = section.getBoundingClientRect();
                    const scrollTop =
                      window.pageYOffset || document.documentElement.scrollTop;
                    const top = rect.top + scrollTop - navHeight;
                    window.scrollTo({ top, behavior: "auto" });
                    attempts++;
                    // Stop if section3 is at the top (with small tolerance) or max attempts reached
                    if (
                      Math.abs(rect.top - navHeight) > 2 &&
                      attempts < maxAttempts
                    ) {
                      requestAnimationFrame(correctScroll);
                    }
                  }
                  setTimeout(() => {
                    correctScroll();
                  }, 350);
                }
              }}
              className="button-border-content bg-black p-4 rounded-full"
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseLeave={(e) => {
                const purple = e.currentTarget.querySelector(
                  ".glitch-text-purple"
                );
                if (!purple) return;
                purple.classList.remove("glitch-done");
                purple.classList.add("glitch-out");
                purple.addEventListener(
                  "animationend",
                  () => {
                    purple.classList.remove("glitch-out");
                    purple.classList.add("glitch-done");
                  },
                  { once: true }
                );
              }}
            >
              <span
                className="glitch-text-white"
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
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
              </span>
              <span
                className="glitch-text-purple"
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-6 h-6 text-[#a259f7]"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </span>
            </button>
            <div className="border-line border-white-1"></div>
            <div className="border-line border-white-2"></div>
            {/* White Glow */}
            <div className="border-white-glow-top"></div>
            <div className="border-white-glow-right"></div>
            <div className="border-white-glow-bottom"></div>
            <div className="border-white-glow-left"></div>
            <div className="border-line border-purple-1"></div>
            <div className="border-line border-purple-2"></div>
            {/* Purple Glow */}
            <div className="border-purple-glow-top"></div>
            <div className="border-purple-glow-right"></div>
            <div className="border-purple-glow-bottom"></div>
            <div className="border-purple-glow-left"></div>
          </div>
        )}
      </div>
    </div>
  );
}
