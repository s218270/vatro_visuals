"use client";
import { useState, useEffect, useRef } from "react";
import { getProjects } from "../lib/getProjects";
import Link from "next/link";
import { useInView } from "react-intersection-observer";
import GlitchButton from "./GlitchButton";
import PreventDownloadWrapper from "./PreventDownloadWrapper";

export default function Section4({ scrollToSection }) {
  const [activeIndex, setActiveIndex] = useState(1);
  const [transitionIndex, setTransitionIndex] = useState(1); // for animation
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState("");
  const [nextBackgroundImage, setNextBackgroundImage] = useState("");
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [projects, setProjects] = useState([]);

  const [visibleCount, setVisibleCount] = useState(3);

  const carouselRef = useRef(null);
  const [slideDirection, setSlideDirection] = useState(null); // 'next' | 'prev' | null
  const [displayed, setDisplayed] = useState([]);
  const buffer = 2; // liczba slotów bufora po każdej stronie
  // Stan ładowania dla każdego slotu karuzeli
  const [loaded, setLoaded] = useState([]);

  // Animation reset refs for carousel cards
  const borderRefs = useRef([]);

  // Animation reset refs for nav buttons
  const navButtonRefs = useRef([]);

  // Intersection observer for carousel cards
  const [carouselInViewRef, carouselInView] = useInView({
    triggerOnce: false,
    threshold: 0.2,
  });

  // --- NOWA LOGIKA: wszystkie elementy renderowane, pozycjonowane absolutnie, widoczne max 3 ---
  // Wylicz pozycje dla wszystkich elementów
  function getItemPosition(i) {
    // Use transitionIndex during animation, otherwise activeIndex
    const total = projects.length;
    const idx = isTransitioning ? transitionIndex : activeIndex;
    // Always 1 invisible on the left, rest on the right
    let pos = i - idx;
    if (pos < -1) pos += total; // wrap left overflow to right
    // Do NOT wrap right overflow, so pos >= visibleCount are on the right
    return pos;
  }

  // Responsywność: liczba widocznych elementów
  useEffect(() => {
    function updateVisibleCount() {
      if (window.innerWidth <= 768) {
        setVisibleCount(1);
      } else if (window.innerWidth <= 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    }
    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  // Loader logic: set loaded state for each project
  useEffect(() => {
    if (!projects.length) return;
    setLoaded(Array(projects.length).fill(false));
  }, [projects.length]);

  useEffect(() => {
    projects.forEach((project, i) => {
      // preload carousel thumbnail (use `thumbnail` field)
      const imageUrl = getImageUrl(project?.thumbnail);
      if (imageUrl && !loaded[i]) {
        const img = new window.Image();
        img.onload = () => handleImageLoad(i);
        img.onerror = () => handleImageLoad(i);
        img.src = imageUrl;
      }
    });
    // eslint-disable-next-line
  }, [projects, loaded]);

  // Animacja przesuwania: po kliknięciu zmieniamy activeIndex, elementy animują transform/opacity
  useEffect(() => {
    if (!isTransitioning || !slideDirection) return;
    // Start animation by updating transitionIndex
    setTransitionIndex((prev) => {
      if (slideDirection === "next") {
        return (prev + 1) % projects.length;
      } else {
        return (prev - 1 + projects.length) % projects.length;
      }
    });
    // After animation duration, update activeIndex and reset transitionIndex
    const timer = setTimeout(() => {
      setActiveIndex((prev) => {
        if (slideDirection === "next") {
          return (prev + 1) % projects.length;
        } else {
          return (prev - 1 + projects.length) % projects.length;
        }
      });
      setIsTransitioning(false);
      setSlideDirection(null);
      setTransitionIndex((idx) => idx); // keep transitionIndex in sync
    }, 1200); // czas animacji
    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, [isTransitioning, slideDirection, projects.length]);

  // Fetch projects from Firestore
  useEffect(() => {
    async function fetchData() {
      // limit carousel dataset to keep homepage light
      const data = await getProjects({ limit: 12 });
      const sorted = sortProjectsByPriority(data);
      setProjects(sorted);
    }
    fetchData();
  }, []);

  // Sort helper: projects with numeric `priority` first (ascending), then others
  function sortProjectsByPriority(list) {
    if (!Array.isArray(list)) return list;
    const withPriority = [];
    const withoutPriority = [];
    for (const item of list) {
      if (typeof item.priority === "number") withPriority.push(item);
      else withoutPriority.push(item);
    }
    withPriority.sort((a, b) => a.priority - b.priority);
    return [...withPriority, ...withoutPriority];
  }

  // Helper to get image url from mainImage
  function getImageUrl(mainImage) {
    if (!mainImage) return "";
    if (typeof mainImage === "string") return mainImage;
    if (mainImage.referencePath) {
      const ref = mainImage.referencePath;
      if (ref.startsWith("http")) return ref;
      const firstSlash = ref.indexOf("/");
      if (firstSlash === -1) return "";
      let bucket = ref.slice(0, firstSlash);
      const path = ref.slice(firstSlash + 1);
      if (bucket.endsWith(".firebasestorage.app")) {
        bucket = bucket.replace(".firebasestorage.app", ".appspot.com");
      }
      if (bucket && path) {
        let url = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(
          path,
        )}?alt=media`;
        if (mainImage.token) {
          url += `&token=${mainImage.token}`;
        }
        // (log usunięty)
        return url;
      }
    }
    return "";
  }

  // Helper to reset border/glow animation
  function resetBorderAnimation(ref) {
    if (!ref?.current) return;
    ref.current.classList.remove("animate-in");
    // Force reflow
    void ref.current.offsetWidth;
    requestAnimationFrame(() => {
      ref.current.classList.add("animate-in");
    });
  }

  // Reset animation on hover for carousel cards
  function handleCardMouseEnter(index, item) {
    setHoveredIndex(index);
    setNextBackgroundImage(getImageUrl(item.mainImage));
    if (borderRefs.current[index]) {
      resetBorderAnimation({ current: borderRefs.current[index] });
    }
  }

  // Update background image to center visible project when no card is hovered
  useEffect(() => {
    if (hoveredIndex === null && projects.length > 0) {
      const centerIdx =
        (activeIndex + getCenteredItemIndex()) % projects.length;
      setNextBackgroundImage(getImageUrl(projects[centerIdx]?.mainImage) || "");
    }
  }, [hoveredIndex, activeIndex, projects, visibleCount, getCenteredItemIndex]);

  // Reset animation on hover for nav buttons
  function handleNavButtonMouseEnter(idx) {
    if (navButtonRefs.current[idx]) {
      resetBorderAnimation({ current: navButtonRefs.current[idx] });
    }
  }

  const handlePrev = () => {
    if (isTransitioning) return;
    setSlideDirection("prev");
    setIsTransitioning(true);
    setTransitionIndex(activeIndex); // start from current
  };

  const handleNext = () => {
    if (isTransitioning) return;
    setSlideDirection("next");
    setIsTransitioning(true);
    setTransitionIndex(activeIndex); // start from current
  };

  // Automatyczne przesuwanie karuzeli co 5 sekund (pauza na hover)
  //   useEffect(() => {
  useEffect(() => {
    if (!projects.length) return;
    const intervalRef = { current: null };
    let paused = false;
    let timeoutRef = null;

    const clearAutoScroll = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (timeoutRef) {
        clearTimeout(timeoutRef);
        timeoutRef = null;
      }
    };

    const startAutoScroll = () => {
      clearAutoScroll();
      intervalRef.current = setInterval(() => {
        if (!paused && !isTransitioning) handleNext();
      }, 5000);
    };

    const onMouseEnter = () => {
      paused = true;
      clearAutoScroll();
    };
    const onMouseLeave = () => {
      paused = false;
      clearAutoScroll();
      timeoutRef = setTimeout(() => {
        startAutoScroll();
      }, 100);
    };

    const node = carouselRef.current;
    if (node) {
      node.addEventListener("mouseenter", onMouseEnter);
      node.addEventListener("mouseleave", onMouseLeave);
    }
    startAutoScroll();

    return () => {
      clearAutoScroll();
      if (node) {
        node.removeEventListener("mouseenter", onMouseEnter);
        node.removeEventListener("mouseleave", onMouseLeave);
      }
    };
    // eslint-disable-next-line
  }, [projects.length, isTransitioning, visibleCount]);

  // Calculate centered item index (musi być przed JSX!)
  function getCenteredItemIndex() {
    return Math.floor(visibleCount / 2);
  }

  // Resetuj loaded jeśli zmienia się liczba projektów lub widocznych slotów
  //   useEffect(() => {
  //     setLoaded(Array(displayed.length).fill(false));
  //   }, [displayed.length, projects.length]);

  // Helper do ładowania obrazka i ustawiania loaded
  function handleImageLoad(idx) {
    setLoaded((prev) => {
      const arr = [...prev];
      arr[idx] = true;
      return arr;
    });
  }

  // Funkcja detekcji iOS
  function isIOS() {
    if (typeof window === "undefined") return false;
    return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.userAgent.includes("Mac") && "ontouchend" in document)
    );
  }

  return (
    <section
      id="section4"
      ref={carouselInViewRef}
      className="min-h-screen w-full flex flex-col items-center justify-center relative bg-[#080808] z-10 overflow-hidden py-[150px]"
    >
      {/* Tło video */}
      <video
        className="absolute inset-0 w-full h-full object-cover z-40"
        src="/xhkqh-b4zb6.webm"
        autoPlay
        loop
        muted
        playsInline
        style={{
          pointerEvents: "none",
          filter: "brightness(0.5) blur(2px)",
        }}
      />
      {/* Gradient overlays for top/bottom fade */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "30vh",
          zIndex: 45,
          pointerEvents: "none",
          background:
            "linear-gradient(to bottom, #080808 0%, transparent 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "30vh",
          zIndex: 45,
          pointerEvents: "none",
          background: "linear-gradient(to top, #080808 0%, transparent 100%)",
        }}
      />
      {/* Additional background layer for smooth transition */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(rgba(8, 8, 8, 0.5), rgba(8, 8, 8, 0.5)), url(${nextBackgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity:
            nextBackgroundImage && nextBackgroundImage !== backgroundImage
              ? 1
              : 0,
          transition: "opacity 0.5s ease-in-out",
          filter: "blur(6px)",
        }}
      />
      <div className="z-50 w-full flex flex-col items-center justify-center">
        <h1 className="text-[#f2f2f2] text-[48px] lg:text-[72px] w-full text-center mb-8">
          Projekty
        </h1>

        {/* Carousel Container */}
        <div className="w-full max-w-6xl mx-auto relative flex flex-col items-center">
          {/* Navigation buttons will sit below the carousel in normal flow */}

          {/* --- NOWA KARUZELA --- */}
          <div
            ref={carouselRef}
            style={{
              width: "100%",
              height: "20rem",
              position: "relative",
              // left: "500px",
            }}
          >
            {projects.map((project, i) => {
              if (!project) return null;
              // use thumbnail for carousel card thumbnail
              const imageUrl = getImageUrl(project.thumbnail);
              const pos = getItemPosition(i);
              // Always render leftmost and rightmost invisible elements for smooth transitions
              const isVisible = pos >= 0 && pos < visibleCount;
              const isLeftHidden = pos === -1;
              const isRightHidden = pos === visibleCount;
              // Responsive gap: smaller on medium devices
              let cardSpacing = "300";
              if (typeof window !== "undefined") {
                if (window.innerWidth <= 1024 && window.innerWidth > 768) {
                  cardSpacing = "200";
                } else if (window.innerWidth <= 768) {
                  cardSpacing = "150";
                }
              }
              const slotWidth = cardSpacing / visibleCount;
              const transition = isTransitioning
                ? "transform 1.2s cubic-bezier(0.77,0,0.175,1), opacity 1.2s cubic-bezier(0.77,0,0.175,1)"
                : "none";
              const show = isVisible || isLeftHidden || isRightHidden;

              return (
                <div
                  key={project.id ? `${project.id}-${i}` : i}
                  className="flex items-end justify-center"
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: `calc(100% / ${visibleCount})`,
                    height: "20rem",
                    opacity: isVisible ? 1 : 0,
                    pointerEvents: isVisible ? "auto" : "none",
                    visibility: show ? "visible" : "hidden",
                    transition,
                    zIndex: isVisible
                      ? 10
                      : isLeftHidden
                        ? 5
                        : isRightHidden
                          ? 5
                          : 1,
                    padding: "1rem",
                    boxSizing: "border-box",
                    transform: `translateX(${slotWidth * pos}%)`,
                  }}
                  onMouseEnter={() => handleCardMouseEnter(i, project)}
                  onMouseLeave={() => {
                    setHoveredIndex(null);
                    setNextBackgroundImage(
                      getImageUrl(
                        projects[
                          (activeIndex + getCenteredItemIndex()) %
                            projects.length
                        ]?.mainImage,
                      ) || "",
                    );
                  }}
                >
                  <Link
                    href={`/projects/${project.id}`}
                    className="w-full h-full"
                    style={{ display: "block", height: "100%" }}
                  >
                    <GlitchButton
                      styles={{
                        padding: 0,
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        ref={(el) => (borderRefs.current[i] = el)}
                        className={`glassmorphism w-full h-[14.5rem] flex items-center justify-center relative`}
                        style={{
                          borderRadius: 3,
                          minHeight: 0,
                          minWidth: 0,
                          padding: 0,
                          transition: "height 0.3s cubic-bezier(0.4,0,0.2,1)",
                          height: hoveredIndex === i ? "18rem" : "14.5rem",
                        }}
                      >
                        {/* Loader tylko w środku karty */}
                        {!loaded[i] && (
                          <div
                            className="flex items-center justify-center w-full h-full z-20"
                            style={{
                              position: "absolute",
                              left: 0,
                              top: 0,
                              right: 0,
                              bottom: 0,
                              background: "none",
                            }}
                          >
                            {typeof window !== "undefined" && isIOS() ? (
                              <div
                                style={{
                                  width: 96,
                                  height: 96,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <div
                                  className="loader-ios"
                                  style={{
                                    width: 96,
                                    height: 96,
                                    border: "6px solid #6a00d1",
                                    borderTop: "6px solid #f2f2f2",
                                    borderRadius: "50%",
                                    animation: "spin 1.2s linear infinite",
                                  }}
                                />
                                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                              </div>
                            ) : (
                              <video
                                src="/Loading_WWW.webm"
                                autoPlay
                                loop
                                muted
                                style={{
                                  width: 96,
                                  height: 96,
                                  objectFit: "contain",
                                  background: "none",
                                }}
                              />
                            )}
                            <style>{`
                          @keyframes spin { 100% { transform: rotate(360deg); } }
                        `}</style>
                          </div>
                        )}

                        <PreventDownloadWrapper
                          className="w-full h-full flex flex-col items-center justify-center overflow-hidden cursor-pointer transition-all duration-200"
                          style={{
                            backgroundImage: getImageUrl(project.thumbnail)
                              ? `url(${getImageUrl(project.thumbnail)})`
                              : undefined,
                            backgroundColor: getImageUrl(project.thumbnail)
                              ? undefined
                              : "#222",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            borderRadius: 3,
                            position: "relative",
                            zIndex: 2,
                          }}
                        >
                          <span
                            className="text-[#f2f2f2] text-xl bg-[#080808]/50 px-4 py-2 rounded-[3px]"
                            style={{
                              zIndex: 3,
                              position: "absolute",
                              top: 0,
                              left: 0,
                            }}
                          >
                            {project.title}
                          </span>
                          {/* Short description on hover */}
                          <div
                            className={`w-full transition-all duration-300 bg-[#080808]/70 text-[#f2f2f2] text-base font-lexend font-light px-4 py-2 rounded-b absolute left-0 bottom-0 ${
                              hoveredIndex === i
                                ? "opacity-100 max-h-32"
                                : "opacity-0 max-h-0 pointer-events-none"
                            }`}
                            style={{
                              zIndex: 4,
                              overflow: "hidden",
                            }}
                          >
                            {project.shortDescription}
                          </div>
                          {/* DEBUG: pokaż URL jeśli nie ma obrazka */}
                          {!getImageUrl(project.thumbnail) && (
                            <span
                              style={{
                                color: "red",
                                fontSize: 10,
                                wordBreak: "break-all",
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: "#f2f2f2",
                                padding: 2,
                              }}
                            >
                              brak obrazka
                              <br />
                              {JSON.stringify(project.thumbnail)}
                            </span>
                          )}
                        </PreventDownloadWrapper>
                      </div>
                    </GlitchButton>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Nav buttons for carousel (normal flow) */}
          <div className="w-full max-w-6xl mx-auto flex justify-between items-center mt-6 z-30">
            <div>
              <GlitchButton
                onClick={handlePrev}
                text={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className="w-6 h-6 text-[#f2f2f2]"
                    style={{ transform: "rotate(90deg)" }}
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
            <div>
              <GlitchButton
                onClick={handleNext}
                text={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className="w-6 h-6 text-[#f2f2f2]"
                    style={{ transform: "rotate(-90deg)" }}
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
          </div>

          {/* See All Link - styled and placed directly below carousel (normal flow) */}
          <div className="w-full flex justify-center items-center mt-8 z-20 h-32">
            <GlitchButton
              styles={{
                padding: "0",
                textAlign: "center",
                justifyContent: "center",
                alignItems: "center",
              }}
              text={
                <Link
                  href="/projects"
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "16px 24px",
                  }}
                >
                  Zobacz wszystkie projekty
                </Link>
              }
            />
          </div>

          {/* Section Navigation Buttons moved to bottom of section (see later) */}
        </div>
      </div>

      {/* Section Navigation Buttons: pinned to section bottom */}
      <div
        className="flex flex-col items-center gap-4 absolute z-50"
        style={{ left: "50%", bottom: 40, transform: "translateX(-50%)" }}
      >
        <GlitchButton
          onClick={() => scrollToSection("section5")}
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
    </section>
  );
}
