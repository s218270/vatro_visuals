import { useEffect, useRef } from "react";
import * as THREE from "three";
// import { sRGBEncoding } from "three"; // Usunięte, używaj THREE.sRGBEncoding
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getResponsiveRadius } from "../utils/logoUtils";

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
      100
    );
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.colorSpace = "srgb";
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // Usuń wszystkie dzieci mount przed dodaniem canvas
    while (mount.firstChild) {
      mount.removeChild(mount.firstChild);
    }
    mount.appendChild(renderer.domElement);
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
    // Animacja z throttlingiem (~30 FPS)
    let lastRenderTime = 0;
    const targetFPS = 30;
    const frameDuration = 1000 / targetFPS;
    const animate = (now) => {
      requestAnimationFrame(animate);
      if (!lastRenderTime || now - lastRenderTime >= frameDuration) {
        renderer.render(scene, camera);
        lastRenderTime = now;
      }
    };
    requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("resize", handleResize);
      ScrollTrigger.getAll().forEach((st) => st.kill());
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
