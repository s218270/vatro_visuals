import { useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Fallback 3D scene for LogoAnimation
export default function ThreeFallbackScene({
  startAngleDeg,
  startVerticalTiltDeg,
  startRadius,
  startSkewDeg,
  angleDeltaDeg,
  verticalTiltDeltaDeg,
  invertVertical,
  setFallbackLoading,
  fallbackMountRef,
}) {
  useEffect(() => {
    const mount = fallbackMountRef.current;
    if (!mount) return;
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
      100,
    );
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // Usuń wszystkie dzieci mount przed dodaniem canvas
    while (mount.firstChild) {
      mount.removeChild(mount.firstChild);
    }
    mount.appendChild(renderer.domElement);
    // Hide canvas until models/prototypes are ready to avoid transient geometry flashes
    try {
      renderer.domElement.style.visibility = "hidden";
    } catch (e) {}
    // Lighting (identycznie jak w fallbacku z LogoAnimation.jsx)
    const ambient = new THREE.AmbientLight(0xffffff, 12.0);
    const hemi = new THREE.HemisphereLight(0xffffff, 0xccccff, 8.0);
    const dir1 = new THREE.DirectionalLight(0xffffff, 4.0);
    dir1.position.set(0, 10, 10);
    dir1.castShadow = false;
    const dir2 = new THREE.DirectionalLight(0xffffff, 4.5);
    dir2.position.set(10, 10, -10);
    dir2.castShadow = false;
    const dir3 = new THREE.DirectionalLight(0xffffff, 4.5);
    dir3.position.set(-10, 10, 10);
    dir3.castShadow = false;
    const dir4 = new THREE.DirectionalLight(0xffffff, 3.5);
    dir4.position.set(0, -10, -10);
    dir4.castShadow = false;
    const dir5 = new THREE.DirectionalLight(0xffffff, 4.5);
    dir5.position.set(0, 0, 15);
    dir5.castShadow = false;
    const dir6 = new THREE.DirectionalLight(0xffffff, 4.5);
    dir6.position.set(0, 0, -15);
    dir6.castShadow = false;
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
    // Particle prototypes for fallback (attempt to load, but fall back to simple meshes)
    let particleProto = null;
    let interactiveParticleProto = null;
    let thirdParticleProto = null;
    const pLoader = new GLTFLoader();
    pLoader.load(
      "/Particles_1 (2).glb",
      (gltf) => {
        particleProto = gltf.scene;
        particleProto.traverse((c) => {
          if (c.isMesh && c.material) {
            c.material = new THREE.MeshStandardMaterial({
              color: c.material.color || 0xe0e0e0,
              metalness: 1.0,
              roughness: 0.15,
              envMap: null,
              envMapIntensity: 0.0,
            });
          }
        });
        loadedPrototypeCount++;
        if (!particlesCreated) createFallbackParticles();
        else {
          try {
            replaceFallbackMeshesWithProto(particleProto, 0);
          } catch (e) {}
        }
      },
      undefined,
      () => {
        // ignore load errors for fallback
      },
    );
    const pLoader2 = new GLTFLoader();
    pLoader2.load(
      "/Particles_2 (2).glb",
      (gltf) => {
        interactiveParticleProto = gltf.scene;
        interactiveParticleProto.traverse((c) => {
          if (c.isMesh && c.material) {
            c.material = new THREE.MeshStandardMaterial({
              color: c.material.color || 0xe0e0e0,
              metalness: 1.0,
              roughness: 0.15,
              envMap: null,
              envMapIntensity: 0.0,
            });
          }
        });
        loadedPrototypeCount++;
        if (!particlesCreated) createFallbackParticles();
        else {
          try {
            replaceFallbackMeshesWithProto(interactiveParticleProto, 1);
          } catch (e) {}
        }
      },
      undefined,
      () => {},
    );
    const pLoader3 = new GLTFLoader();
    pLoader3.load(
      "/Particles_3 (2).glb",
      (gltf) => {
        thirdParticleProto = gltf.scene;
        thirdParticleProto.traverse((c) => {
          if (c.isMesh && c.material) {
            c.material = new THREE.MeshStandardMaterial({
              color: c.material.color || 0xe0e0e0,
              metalness: 1.0,
              roughness: 0.15,
              envMap: null,
              envMapIntensity: 0.0,
            });
          }
        });
        loadedPrototypeCount++;
        if (!particlesCreated) createFallbackParticles();
        else {
          try {
            replaceFallbackMeshesWithProto(thirdParticleProto, 2);
          } catch (e) {}
        }
      },
      undefined,
      () => {},
    );
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
          try {
            removePrimitivePlaceholders();
            renderer.domElement.style.visibility = "visible";
          } catch (e) {}
          // --- Synchronizuj animację z główną sceną ---
          const center = new THREE.Vector3();
          modelPositions.forEach((pos) => center.add(pos));
          center.divideScalar(modelPositions.length);
          let skewAngle = THREE.MathUtils.degToRad(startSkewDeg);
          const initialVerticalTilt =
            THREE.MathUtils.degToRad(startVerticalTiltDeg);
          const angleOffset = THREE.MathUtils.degToRad(startAngleDeg) + Math.PI;
          const angleDelta = THREE.MathUtils.degToRad(angleDeltaDeg);
          let verticalTiltDelta =
            THREE.MathUtils.degToRad(verticalTiltDeltaDeg);
          if (invertVertical) verticalTiltDelta = -verticalTiltDelta;

          // --- ANIMACJA: identyczna jak w LogoAnimation.jsx ---
          // 1. Skew (roll) value from startSkewDeg to 0 (0-70% scroll)
          let skewObj = { value: skewAngle };
          gsap.to(skewObj, {
            value: 0,
            scrollTrigger: {
              trigger: mount,
              start: "top top",
              end: "280%",
              scrub: true,
            },
            onUpdate: () => {
              skewAngle = skewObj.value;
            },
          });

          // 2. Animate each model's z position to 0 on scroll (0-70% scroll)
          scene.children.forEach((child, i) => {
            if (child.isGroup || child.isMesh) {
              gsap.to(child.position, {
                z: 0,
                scrollTrigger: {
                  trigger: mount,
                  start: "top top",
                  end: "280%",
                  scrub: true,
                },
              });
            }
          });

          // 3. Camera animation: angle/tilt for 0-100% scroll (continuous)
          function updateCameraPosition(angleRad, verticalTiltRad, extra = {}) {
            let extraX = extra.x || 0;
            let extraY = extra.y || 0;
            let extraRoll = extra.roll || 0;
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
            if (extraRoll) {
              const rollQuat = new THREE.Quaternion();
              rollQuat.setFromAxisAngle(new THREE.Vector3(0, 0, 1), extraRoll);
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
              updateCameraPosition(orbit.angle, orbit.verticalTilt, {
                roll,
              });
            },
            onComplete: () => {
              ScrollTrigger.refresh();
            },
          });

          // 4. Animate radius (zoom out) after 45% scroll
          let radiusObj = {
            value: getResponsiveRadius(startRadius),
          };
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

          // 5. ENTRY ANIMATION: Always play on mount, camera always scroll-synced
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
    // Match desktop: no scene.background (desktop uses HDR environment for reflections)
    scene.background = null;

    // --- Fallback particles: create a combined particle layer for mobile ---
    const combinedGroup = new THREE.Group();
    const combinedParticles = [];
    const FALLBACK_COUNT = 400; // match desktop total count
    const MIN_BASE_SCALE = 3.0; // match desktop minimum scale

    // Create particles only after at least one GLB prototype has loaded.
    // This avoids showing placeholder spheres while GLBs are still downloading.
    let particlesCreated = false;
    let loadedPrototypeCount = 0;
    // If no prototypes load within this timeout, skip creating primitive placeholders
    // and leave only the glow/volumetric cone. (prevents flashing spheres)
    const PROTO_LOAD_TIMEOUT = 5000; // ms
    let protoTimeout = setTimeout(() => {
      if (!particleProto && !interactiveParticleProto && !thirdParticleProto) {
        particlesCreated = true; // mark created so we don't attempt primitive fallbacks
        setFallbackLoading(false);
        try {
          removePrimitivePlaceholders();
          renderer.domElement.style.visibility = "visible";
        } catch (e) {}
        console.warn(
          "Fallback: no particle prototypes loaded in time — skipping particles",
        );
      }
    }, PROTO_LOAD_TIMEOUT);

    function createFallbackParticles() {
      if (particlesCreated) return;
      // if no prototypes loaded yet, do nothing
      if (!particleProto && !interactiveParticleProto && !thirdParticleProto)
        return;
      // clear timeout once we begin creating particles
      if (protoTimeout) {
        clearTimeout(protoTimeout);
        protoTimeout = null;
      }
      // remove any stray primitive placeholders before creating GLB-based particles
      try {
        removePrimitivePlaceholders();
      } catch (e) {}
      for (let i = 0; i < FALLBACK_COUNT; i++) {
        const r = 30 + Math.random() * 40;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.cos(phi);
        const z = r * Math.sin(phi) * Math.sin(theta);
        const typeIndex = Math.floor(Math.random() * 3);
        // choose an available prototype (prefer the requested type if loaded)
        let proto = null;
        if (typeIndex === 0)
          proto =
            particleProto || interactiveParticleProto || thirdParticleProto;
        else if (typeIndex === 1)
          proto =
            interactiveParticleProto || particleProto || thirdParticleProto;
        else
          proto =
            thirdParticleProto || particleProto || interactiveParticleProto;
        if (!proto) {
          // if somehow none available, skip this particle
          continue;
        }
        const inst = proto.clone(true);
        inst.traverse((c) => {
          if (c.isMesh) {
            c.material = new THREE.MeshStandardMaterial({
              color: (c.material && c.material.color) || 0xe0e0e0,
              metalness: 1.0,
              roughness: 0.15,
              envMap: null,
              envMapIntensity: 0.0,
            });
            c.castShadow = false;
            c.receiveShadow = false;
          }
        });
        inst.position.set(x, y, z);
        try {
          const minCamDist = 35;
          const camPos = camera.position.clone();
          if (inst.position.distanceTo(camPos) < minCamDist) {
            const dir = inst.position.clone().sub(camPos).normalize();
            inst.position.copy(
              camPos.clone().add(dir.multiplyScalar(minCamDist)),
            );
          }
        } catch (e) {}
        // Slightly increase particle sizes (~15%) for a fuller look
        const baseScale = Math.max(
          (0.36 + Math.random() * 3.96) * 2.3,
          MIN_BASE_SCALE,
        );
        inst.scale.set(baseScale, baseScale, baseScale);
        const pObj = {
          mesh: inst,
          basePosition: inst.position.clone(),
          typeIndex,
          baseScale,
          amp: new THREE.Vector3(
            0.18 + Math.random() * 0.6,
            0.12 + Math.random() * 0.4,
            0.18 + Math.random() * 0.6,
          ),
          freqX: 0.08 + Math.random() * 0.25,
          freqY: 0.06 + Math.random() * 0.2,
          freqZ: 0.08 + Math.random() * 0.25,
          phaseX: Math.random() * Math.PI * 2,
          phaseY: Math.random() * Math.PI * 2,
          phaseZ: Math.random() * Math.PI * 2,
          wobbleDir: new THREE.Vector3(
            Math.random() * 2 - 1,
            Math.random() * 2 - 1,
            Math.random() * 2 - 1,
          ).normalize(),
          pulseNext: Math.random() * 5 + 0.8,
          pulseDuration: 0.6 + Math.random() * 1.2,
          pulseAmp: 0.06 + Math.random() * 0.18,
          pulsing: false,
          pulseStart: 0,
        };
        combinedParticles.push(pObj);
        combinedGroup.add(inst);
      }
      scene.add(combinedGroup);
      particlesCreated = true;
    }

    // Remove any primitive placeholder meshes (sphere/icosahedron) that might
    // have been created elsewhere or by incorrect prototypes. This helps
    // eliminate the flashing large spheres the user reported.
    function removePrimitivePlaceholders() {
      try {
        const toRemove = [];
        scene.traverse((c) => {
          if (c.isMesh && c.geometry) {
            const gName = c.geometry.type || "";
            if (
              gName.includes("Sphere") ||
              gName.includes("Icosahedron") ||
              (c.scale && Math.max(c.scale.x, c.scale.y, c.scale.z) > 40)
            ) {
              toRemove.push(c);
            }
          }
        });
        toRemove.forEach((m) => {
          if (m.parent) m.parent.remove(m);
          if (m.geometry) m.geometry.dispose && m.geometry.dispose();
          if (m.material) m.material.dispose && m.material.dispose();
        });
      } catch (e) {}
    }

    // When GLB prototypes finish loading, replace placeholder meshes with them
    function replaceFallbackMeshesWithProto(
      proto,
      typeIndexToMatch,
      materialOpts = {},
    ) {
      try {
        if (!proto) return;
        combinedParticles.forEach((p) => {
          try {
            if (p.typeIndex !== typeIndexToMatch) return;
            const old = p.mesh;
            const newInst = proto.clone(true);
            newInst.traverse((c) => {
              if (c.isMesh) {
                c.material = new THREE.MeshStandardMaterial(
                  Object.assign(
                    {
                      color: (c.material && c.material.color) || 0xe0e0e0,
                      metalness: 1.0,
                      roughness: 0.15,
                      envMap: null,
                      envMapIntensity: 0.0,
                    },
                    materialOpts,
                  ),
                );
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
      } catch (e) {}
    }

    // Add purple glow sprite and subtle volumetric cone to better match desktop look
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
    // Create glow sprite; size and position computed each frame to match
    // 60% of viewport width and 40% of viewport height at a fixed distance.
    const glowSprite = new THREE.Sprite(glowMat);
    scene.add(glowSprite);
    let glowPulse = 0;

    // subtle volumetric cone similar to desktop (adds depth without HDR)
    const volGeom = new THREE.ConeGeometry(1, 1, 48, 1, true);
    const volMat = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color("#6a00d1") },
        uOpacity: { value: 0.12 },
      },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `uniform vec3 uColor; uniform float uOpacity; varying vec2 vUv; void main(){ float head = smoothstep(0.0, 0.25, vUv.y); float tail = 1.0 - vUv.y; float alpha = head * tail; float seam = min(vUv.x, 1.0 - vUv.x); alpha *= smoothstep(0.0, 0.2, seam); gl_FragColor = vec4(uColor, alpha * uOpacity); }`,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      side: THREE.DoubleSide,
    });
    const volumetricCone = new THREE.Mesh(volGeom, volMat);
    scene.add(volumetricCone);

    // Resize
    let lastViewportWidth = window.innerWidth;
    function handleResize() {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      radius = getResponsiveRadius(startRadius);
      // no static glow scaling here; animate() computes exact world size per-frame
      if (window.innerWidth !== lastViewportWidth) {
        lastViewportWidth = window.innerWidth;
        ScrollTrigger.refresh();
      }
    }
    window.addEventListener("resize", handleResize);
    // Animacja z throttlingiem (~30 FPS)
    let lastRenderTime = 0;
    const targetFPS = 30;
    const frameDuration = 1000 / targetFPS;
    const animate = (now) => {
      requestAnimationFrame(animate);
      if (!lastRenderTime || now - lastRenderTime >= frameDuration) {
        // update fallback particles (autonomous wobble + pulsing) before render
        try {
          const t = performance.now() * 0.001;
          if (
            typeof combinedParticles !== "undefined" &&
            combinedParticles.length
          ) {
            const centerVec = new THREE.Vector3(0, 0, 0);
            for (const p of combinedParticles) {
              const wx =
                Math.sin(t * p.freqX + p.phaseX) * (p.amp ? p.amp.x : 0);
              const wy =
                Math.cos(t * p.freqY + p.phaseY) * (p.amp ? p.amp.y : 0);
              const wz =
                Math.sin(t * p.freqZ + p.phaseZ) * (p.amp ? p.amp.z : 0);
              const iox = (p.wobbleDir ? p.wobbleDir.x : 0) * wx;
              const ioy = (p.wobbleDir ? p.wobbleDir.y : 0) * wy;
              const ioz = (p.wobbleDir ? p.wobbleDir.z : 0) * wz;
              const target = p.basePosition
                .clone()
                .add(new THREE.Vector3(iox, ioy, ioz));
              if (p.mesh) {
                p.mesh.position.copy(target);
                // pulsing
                const nowT = t;
                if (!p.pulsing && nowT >= (p.pulseNext || 0)) {
                  p.pulsing = true;
                  p.pulseStart = nowT;
                  p.pulseEnd = nowT + (p.pulseDuration || 1.0);
                }
                let newScale = p.baseScale || 1;
                if (p.pulsing) {
                  const pr = Math.max(
                    0,
                    Math.min(
                      1,
                      (nowT - p.pulseStart) / (p.pulseDuration || 1.0),
                    ),
                  );
                  if (pr >= 1) {
                    p.pulsing = false;
                    p.pulseNext = nowT + 2 + Math.random() * 6;
                  } else {
                    const ease = 0.5 - 0.5 * Math.cos(pr * Math.PI * 2);
                    newScale =
                      (p.baseScale || 1) * (1 + (p.pulseAmp || 0.12) * ease);
                  }
                }
                p.mesh.scale.set(newScale, newScale, newScale);
              }
            }
          }
          // position glow sprite and volumetric cone relative to camera
          try {
            const forward = new THREE.Vector3();
            camera.getWorldDirection(forward);
            // place glow at fixed distance in front of camera and size it
            // so it covers 60% of viewport width and 40% of viewport height
            const DIST = 7.0;
            const fovRad = THREE.MathUtils.degToRad(camera.fov);
            const frustumHeight = 2 * DIST * Math.tan(fovRad / 2);
            const frustumWidth = frustumHeight * camera.aspect;
            // adjust size: make it a bit less wide and a bit taller
            const spriteW = frustumWidth * 0.9; // slightly less than full width
            // increase height by 50%
            const spriteH = frustumHeight * 1.5; // 150% of the previous height fraction
            // set non-uniform scale to achieve desired aspect on screen
            glowSprite.scale.set(spriteW, spriteH, 1.0);
            // position: move glow slightly higher above the scene
            const up = new THREE.Vector3(0, 1, 0);
            // move up by half of the 50% increase => +0.25 * frustumHeight
            const centerOffsetY = frustumHeight * (0.58 + 0.25); // ~0.83*frustumHeight
            const glowPos = camera.position
              .clone()
              .add(forward.clone().multiplyScalar(DIST))
              .add(up.clone().multiplyScalar(centerOffsetY));
            glowSprite.position.copy(glowPos);
            glowSprite.quaternion.copy(camera.quaternion);
            glowPulse += 0.012;
            let base = 1.0;
            let pulse = Math.sin(glowPulse) * 0.06;
            glowMat.opacity = Math.min(1.0, base + pulse);
            volumetricCone.position.copy(
              camera.position
                .clone()
                .add(forward.clone().multiplyScalar(6))
                .add(new THREE.Vector3(0, -4.0, 0)),
            );
            volumetricCone.quaternion.copy(camera.quaternion);
            volumetricCone.scale.set(12.0, 22.0, 12.0);
          } catch (e) {}
        } catch (e) {}
        renderer.render(scene, camera);
        lastRenderTime = now;
      }
    };
    requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("resize", handleResize);
      ScrollTrigger.getAll().forEach((st) => st.kill());
      // clear proto timeout if still pending
      try {
        if (protoTimeout) {
          clearTimeout(protoTimeout);
          protoTimeout = null;
        }
      } catch (e) {}
      // (no cube render target used in fallback)
      renderer.dispose();
      // Usuń wszystkie dzieci mount po odmontowaniu
      while (mount.firstChild) {
        mount.removeChild(mount.firstChild);
      }
    };
    // eslint-disable-next-line
  }, [
    startAngleDeg,
    startVerticalTiltDeg,
    startRadius,
    startSkewDeg,
    angleDeltaDeg,
    verticalTiltDeltaDeg,
    invertVertical,
    setFallbackLoading,
    fallbackMountRef,
  ]);
  return (
    <div ref={fallbackMountRef} style={{ width: "100%", height: "100%" }} />
  );
}
