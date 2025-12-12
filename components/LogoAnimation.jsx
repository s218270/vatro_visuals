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
    // centroid of models (populated after models load)
    let sceneCenter = new THREE.Vector3();
    // ambientGroup will be created later; keep reference so we can position it relative to models
    let ambientGroup = null;

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
                        c.position.add(sceneCenter)
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

    // Usunięto poprzednie fioletowe tło shaderowe — zostaje tylko nowe tło (promień + particles)

    // === Spotlight w kolorze #6a00d1, przytwierdzony do kamery (pozycja zależna od kamery),
    // kierunek stały w stronę górnej części sceny ===
    const spotlight = new THREE.SpotLight(
      "#6a00d1",
      3.5,
      80,
      THREE.MathUtils.degToRad(32),
      0.85,
      1.0
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
        size / 2
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
        size / 2
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

    // Increase ambient particle count for denser dome (doubled)
    const ambientCount = 180;
    ambientGroup = new THREE.Group();
    const ambientParticles = [];
    // Ambient particles as soft sprites (blurred points) for low-cost, soft metallic feel
    for (let i = 0; i < ambientCount; i++) {
      const mat = new THREE.SpriteMaterial({
        map: spriteTextureSmall,
        color: new THREE.Color("#ffffff"),
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
      });
      const s = new THREE.Sprite(mat);
      // Rozmieszczenie w formie kopuły (hemisfera) wokół środka sceny
      const r = 30 + Math.random() * 40; // promień od środka (30..70)
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random());
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.sin(theta);
      s.position.set(x, y, z);
      // Limit scale so none become visually huge
      const baseScale = 0.18 + Math.random() * 0.18; // 0.18 .. 0.36
      s.scale.set(baseScale, baseScale, baseScale);
      // Zapamiętaj bazową pozycję i parametry smooth ruchu (sinusoidalnie) oraz puls
      const ambObj = {
        sprite: s,
        basePosition: s.position.clone(),
        // slightly larger autonomous amplitudes so motion is visible
        amp: new THREE.Vector3(
          0.22 + Math.random() * 0.9,
          0.12 + Math.random() * 0.5,
          0.22 + Math.random() * 0.9
        ),
        // per-axis frequencies and phases for less correlated motion
        freqX: 0.08 + Math.random() * 0.32,
        freqY: 0.06 + Math.random() * 0.28,
        freqZ: 0.08 + Math.random() * 0.32,
        phaseX: Math.random() * Math.PI * 2,
        phaseY: Math.random() * Math.PI * 2,
        phaseZ: Math.random() * Math.PI * 2,
        // random local wobble direction so particles don't all move same way
        wobbleDir: new THREE.Vector3(
          Math.random() * 2 - 1,
          Math.random() * 2 - 1,
          Math.random() * 2 - 1
        ).normalize(),
        baseScale,
        // pulse scheduling: next pulse (seconds from start), duration and amplitude
        pulseNext: Math.random() * 6 + 1, // first pulse after 1..7s
        pulseDuration: 0.6 + Math.random() * 1.2, // 0.6..1.8s
        pulseAmp: 0.06 + Math.random() * 0.24,
        pulsing: false,
        pulseStart: 0,
      };
      ambientParticles.push(ambObj);
      // Ensure particles are not spawned too close to the camera
      try {
        const minCamDist = 35;
        const camPos = camera.position.clone();
        const d = ambObj.sprite.position.distanceTo(camPos);
        if (d < minCamDist) {
          const dir = ambObj.sprite.position.clone().sub(camPos).normalize();
          ambObj.sprite.position.copy(
            camPos.clone().add(dir.multiplyScalar(minCamDist))
          );
          ambObj.basePosition = ambObj.sprite.position.clone();
        }
      } catch (e) {}
      ambientGroup.add(s);
    }
    scene.add(ambientGroup);

    // === Particles: interactive (larger, follow mouse) ===
    // Interactive particles now live on a sphere surrounding the scene center.
    // We'll store each particle's base world position and then rotate the
    // entire sphere (a quaternion) based on mouse yaw/pitch. This creates
    // the effect of a spherical shell rotating toward the mouse, not a single
    // flat ring.
    const interactiveCount = 100;
    const interactiveGroup = new THREE.Group();
    const interactiveParticles = [];
    // use true spheres (moderate segments for smooth reflections) so HDR env
    // looks correct on the surface. Keep segments moderate for perf.
    const interactiveGeom = new THREE.SphereGeometry(1.0, 12, 10);
    for (let i = 0; i < interactiveCount; i++) {
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color("#ffffff"),
        metalness: 1.0,
        roughness: 0.06,
        envMapIntensity: 1.6,
      });
      const m = new THREE.Mesh(interactiveGeom, mat);
      // place on spherical shell radius 30..70
      const r = 30 + Math.random() * 40;
      const theta = Math.random() * Math.PI * 2; // azimuth
      const phi = Math.acos(2 * Math.random() - 1); // inclination
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.sin(theta);
      m.position.set(x, y, z);
      const baseScale = 0.28 + Math.random() * 0.32; // smaller: 0.28 .. 0.6
      m.scale.set(baseScale, baseScale, baseScale);
      const intObj = {
        mesh: m,
        basePosition: m.position.clone(), // world-space base pos
        baseScale,
        // stronger autonomous amplitude so spheres move noticeably
        amp: new THREE.Vector3(
          0.28 + Math.random() * 0.9,
          0.12 + Math.random() * 0.5,
          0.28 + Math.random() * 0.9
        ),
        // per-axis frequencies/phases for unique autonomous motion (faster)
        freqX: 0.08 + Math.random() * 0.36,
        freqY: 0.06 + Math.random() * 0.3,
        freqZ: 0.08 + Math.random() * 0.36,
        phaseX: Math.random() * Math.PI * 2,
        phaseY: Math.random() * Math.PI * 2,
        phaseZ: Math.random() * Math.PI * 2,
        // each particle has a slightly different wobble direction
        wobbleDir: new THREE.Vector3(
          Math.random() * 2 - 1,
          Math.random() * 2 - 1,
          Math.random() * 2 - 1
        ).normalize(),
        // pulse scheduling for interactive spheres as well
        pulseNext: Math.random() * 5 + 0.8,
        pulseDuration: 0.7 + Math.random() * 1.2,
        pulseAmp: 0.08 + Math.random() * 0.22,
        pulsing: false,
        pulseStart: 0,
      };
      interactiveParticles.push(intObj);
      try {
        const minCamDistI = 35;
        const camPosI = camera.position.clone();
        const di = intObj.mesh.position.distanceTo(camPosI);
        if (di < minCamDistI) {
          const diri = intObj.mesh.position.clone().sub(camPosI).normalize();
          intObj.mesh.position.copy(
            camPosI.clone().add(diri.multiplyScalar(minCamDistI))
          );
          intObj.basePosition = intObj.mesh.position.clone();
        }
      } catch (e) {}
      interactiveGroup.add(m);
    }
    scene.add(interactiveGroup);

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
    // Max yaw reduced by additional 30% per request: previously PI*0.5 (~90°),
    // now 70% of that => PI*0.35 (~63°).
    const MAX_YAW = Math.PI * 0.35; // ~63° max yaw
    const MAX_PITCH = Math.PI * 0.28; // how far up/down the shell rotates

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

      // Ambient particles drift
      // Ambient particles: smooth sinusoidal motion around basePosition (slower, smoother)
      const t = performance.now() * 0.001;
      for (const ap of ambientParticles) {
        // per-axis independent wobble, projected along a per-particle wobbleDir
        const wx = Math.sin(t * ap.freqX + ap.phaseX) * ap.amp.x;
        const wy = Math.cos(t * ap.freqY + ap.phaseY) * ap.amp.y;
        const wz = Math.sin(t * ap.freqZ + ap.phaseZ) * ap.amp.z;
        const target = ap.basePosition
          .clone()
          .add(
            new THREE.Vector3(
              ap.wobbleDir.x * wx,
              ap.wobbleDir.y * wy,
              ap.wobbleDir.z * wz
            )
          );
        if (ap.sprite) {
          ap.sprite.position.copy(target);
          // scheduled pulsing: occasional grow -> shrink with random pauses
          const now = t;
          if (!ap.pulsing && now >= (ap.pulseNext || 0)) {
            ap.pulsing = true;
            ap.pulseStart = now;
            ap.pulseEnd = now + (ap.pulseDuration || 1.0);
          }
          let newScale = ap.baseScale;
          if (ap.pulsing) {
            const p = Math.max(
              0,
              Math.min(1, (now - ap.pulseStart) / (ap.pulseDuration || 1.0))
            );
            if (p >= 1) {
              ap.pulsing = false;
              // schedule next pulse with a random gap (2..8s)
              ap.pulseNext = now + 2 + Math.random() * 6;
            } else {
              // ease-in-out grow then shrink: use full cosine cycle (0->0, 0.5->1, 1->0)
              const ease = 0.5 - 0.5 * Math.cos(p * Math.PI * 2);
              newScale = ap.baseScale * (1 + (ap.pulseAmp || 0.12) * ease);
            }
          }
          ap.sprite.scale.set(newScale, newScale, newScale);
        }
      }

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
      // tuned so ease-out finishes somewhat faster
      const BASE_SPEED = 0.09; // stronger base so easing finishes quicker
      const EXTRA_SPEED = 1.8; // scales with normalized distance for responsiveness
      const yawLerp = Math.min(
        1,
        (BASE_SPEED + EXTRA_SPEED * yawNorm2) * yawEase2
      );
      const pitchLerp = Math.min(
        1,
        (BASE_SPEED + EXTRA_SPEED * pitchNorm2) * pitchEase2
      );
      sphereRotation.currentYaw = THREE.MathUtils.lerp(
        sphereRotation.currentYaw,
        yawTarget,
        yawLerp
      );
      sphereRotation.currentPitch = THREE.MathUtils.lerp(
        sphereRotation.currentPitch,
        pitchTarget,
        pitchLerp
      );
      // hard clamp to allowed range
      sphereRotation.currentYaw = Math.max(
        -MAX_YAW,
        Math.min(MAX_YAW, sphereRotation.currentYaw)
      );
      sphereRotation.currentPitch = Math.max(
        -MAX_PITCH,
        Math.min(MAX_PITCH, sphereRotation.currentPitch)
      );

      // build quaternion (rotate Y then X)
      const euler = new THREE.Euler(
        sphereRotation.currentPitch,
        sphereRotation.currentYaw,
        0,
        "YXZ"
      );
      const rotQuat = new THREE.Quaternion().setFromEuler(euler);

      const centerVec = sceneCenter
        ? sceneCenter.clone()
        : new THREE.Vector3(0, 0, 0);
      for (const ip of interactiveParticles) {
        // per-axis independent wobble, projected along each particle's
        // wobbleDir so autonomous motion varies per particle
        const wx = Math.sin(t * ip.freqX + ip.phaseX) * ip.amp.x;
        const wy = Math.cos(t * ip.freqY + ip.phaseY) * ip.amp.y;
        const wz = Math.sin(t * ip.freqZ + ip.phaseZ) * ip.amp.z;
        const iox = ip.wobbleDir.x * wx;
        const ioy = ip.wobbleDir.y * wy;
        const ioz = ip.wobbleDir.z * wz;

        // base position relative to center, rotated by the global quaternion
        const rel = ip.basePosition.clone().sub(centerVec);
        const rotated = rel.applyQuaternion(rotQuat);
        const final = rotated
          .add(new THREE.Vector3(iox, ioy, ioz))
          .add(centerVec);

        if (ip.mesh) {
          ip.mesh.position.copy(final);
          // scheduled pulsing for interactive spheres
          const nowI = t;
          if (!ip.pulsing && nowI >= (ip.pulseNext || 0)) {
            ip.pulsing = true;
            ip.pulseStart = nowI;
            ip.pulseEnd = nowI + (ip.pulseDuration || 1.0);
          }
          let newScaleI = ip.baseScale;
          if (ip.pulsing) {
            const pI = Math.max(
              0,
              Math.min(1, (nowI - ip.pulseStart) / (ip.pulseDuration || 1.0))
            );
            if (pI >= 1) {
              ip.pulsing = false;
              ip.pulseNext = nowI + 2 + Math.random() * 6;
            } else {
              const easeI = 0.5 - 0.5 * Math.cos(pI * Math.PI * 2);
              newScaleI = ip.baseScale * (1 + (ip.pulseAmp || 0.12) * easeI);
            }
          }
          ip.mesh.scale.set(newScaleI, newScaleI, newScaleI);
          // Clamp distance from center
          const distFromCenter = new THREE.Vector3()
            .subVectors(ip.mesh.position, centerVec)
            .length();
          if (distFromCenter > 200) {
            const dir = ip.mesh.position.clone().sub(centerVec).normalize();
            ip.mesh.position.copy(
              centerVec.clone().add(dir.multiplyScalar(200))
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
