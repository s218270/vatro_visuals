"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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

  useEffect(() => {
    const mount = mountRef.current;

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

    // --- Set Grunge.hdr as scene background ---
    new RGBELoader()
      .setDataType(THREE.FloatType)
      .setPath("/meshes/")
      .load("Grunge.hdr", (grungeHdr) => {
        const grungeMap = pmremGenerator.fromEquirectangular(grungeHdr).texture;
        scene.background = grungeMap;

        // Now load the old HDR for environment
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
                        envMap,
                        envMapIntensity: 1.5,
                        metalness: 1,
                        roughness: 0.1,
                      });
                    }
                  });

                  scene.add(model);
                  modelsLoaded++;
                  if (modelsLoaded === modelInfos.length) {
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
                      // Animate skew (roll) value from startSkewDeg to 0 (0-80% scroll)
                      let skewObj = { value: skewAngle };
                      gsap.to(skewObj, {
                        value: 0,
                        scrollTrigger: {
                          trigger: mount,
                          start: "top top",
                          end: "320%", // 80% of 400%
                          scrub: true,
                        },
                        onUpdate: () => {
                          skewAngle = skewObj.value;
                        },
                      });

                      // Animate each model's z position to 0 on scroll (full scroll)
                      scene.children.forEach((child) => {
                        if (child.isGroup || child.isMesh) {
                          gsap.to(child.position, {
                            z: 0,
                            scrollTrigger: {
                              trigger: mount,
                              start: "top top",
                              end: "400%",
                              scrub: true,
                            },
                          });
                        }
                      });

                      // Animate radius (zoom out) from 40% to 100% of scroll, with easing
                      let radiusObj = {
                        value: getResponsiveRadius(startRadius),
                      };
                      gsap.to(radiusObj, {
                        value: getResponsiveRadius(zoomEndRadius),
                        scrollTrigger: {
                          trigger: mount,
                          start: "160%", // 40% of 400%
                          end: "400%",
                          scrub: true,
                        },
                        ease: "power1.inOut",
                        onUpdate: () => {
                          radius = radiusObj.value;
                        },
                      });

                      // Camera animation: angle/tilt for 0-80% scroll, then hold
                      function updateCameraPosition(angleRad, verticalTiltRad) {
                        const x = radius * Math.sin(angleRad);
                        const y = radius * Math.cos(verticalTiltRad);
                        const z = radius * Math.cos(angleRad);

                        const camPos = new THREE.Vector3(
                          center.x + x,
                          center.y + y,
                          center.z + z
                        );

                        camera.position.copy(camPos);

                        // Teraz obliczamy kierunek do środka (center)
                        const dir = new THREE.Vector3()
                          .subVectors(center, camPos)
                          .normalize();

                        const up = new THREE.Vector3(0, 1, 0);
                        const lookAtMatrix = new THREE.Matrix4();
                        lookAtMatrix.lookAt(camPos, center, up);
                        const quat = new THREE.Quaternion();
                        quat.setFromRotationMatrix(lookAtMatrix);
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
                      gsap.to(orbit, {
                        angle: -angleOffset + Math.PI, // rotate 180° to the other side
                        verticalTilt: Math.PI / 2, // end upright (level with horizon)
                        scrollTrigger: {
                          trigger: mount,
                          start: "top top",
                          end: "320%", // 80% of 400%
                          scrub: true,
                        },
                        onUpdate: () => {
                          updateCameraPosition(orbit.angle, orbit.verticalTilt);
                        },
                        onComplete: () => {
                          ScrollTrigger.refresh();
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
      });

    // --- REMOVE MIST PARTICLE SYSTEM (no longer needed) ---

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
  ]);

  return (
    <div className="h-[400vh] w-full relative bg-black">
      {/* Grunge.hdr is now used as the Three.js background, so remove the static background div */}
      {/* <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 0,
          backgroundImage: "url(/meshes/Grunge.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          pointerEvents: "none",
        }}
      /> */}
      <div className="sticky top-0 h-screen w-full" style={{ zIndex: 1 }}>
        <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
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
            <div className="border-line border-purple-1"></div>
            <div className="border-line border-purple-2"></div>
          </div>
        )}
      </div>
    </div>
  );
}
