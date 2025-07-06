"use client";
import { useState, useEffect, useRef } from "react";
import { getProjects } from "../lib/getProjects";
import Link from "next/link";
import { useInView } from "react-intersection-observer";

export default function Section4({ scrollToSection }) {
  const [activeIndex, setActiveIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState("");
  const [nextBackgroundImage, setNextBackgroundImage] = useState("");
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [projects, setProjects] = useState([]);
  const [visibleCount, setVisibleCount] = useState(3);
  const carouselRef = useRef(null);

  // Animation reset refs for carousel cards
  const borderRefs = useRef([]);

  // Animation reset refs for nav buttons
  const navButtonRefs = useRef([]);

  // Intersection observer for carousel cards
  const [carouselInViewRef, carouselInView] = useInView({
    triggerOnce: false,
    threshold: 0.2,
  });

  // Fetch projects from Firestore
  useEffect(() => {
    async function fetchData() {
      const data = await getProjects();
      setProjects(data);
    }
    fetchData();
  }, []);

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
          path
        )}?alt=media`;
        if (mainImage.token) {
          url += `&token=${mainImage.token}`;
        }
        if (typeof window !== "undefined") {
          // eslint-disable-next-line no-console
          console.log(
            "FIREBASE IMAGE URL:",
            url,
            "| bucket:",
            bucket,
            "| path:",
            path,
            mainImage.token ? `| token: ${mainImage.token}` : ""
          );
        }
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

  // Reset animation on view entry for carousel cards
  useEffect(() => {
    if (carouselInView) {
      borderRefs.current.forEach((el) => {
        if (el) resetBorderAnimation({ current: el });
      });
    }
  }, [carouselInView]);

  // Reset animation on hover for nav buttons
  function handleNavButtonMouseEnter(idx) {
    if (navButtonRefs.current[idx]) {
      resetBorderAnimation({ current: navButtonRefs.current[idx] });
    }
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

  // --- INFINITE CAROUSEL: BEZ PRZESKOKÓW, MODULO, Z BUFOREM ---
  // Renderujemy widoczne sloty + bufor (2 przed i 2 po)

  // Startowy index
  useEffect(() => {
    setActiveIndex(0);
  }, [visibleCount, projects.length]);

  const [slideDirection, setSlideDirection] = useState(null); // 'next' | 'prev' | null
  const [displayed, setDisplayed] = useState([]);
  const buffer = 2; // liczba slotów bufora po każdej stronie

  // Ustaw sloty na start i po każdej zmianie activeIndex
  useEffect(() => {
    if (projects.length === 0) return;
    const total = projects.length;
    const count = Math.min(total, visibleCount);
    // Wylicz indeksy: [activeIndex-buffer, ..., activeIndex+count+buffer-1]
    const arr = [];
    for (let i = -buffer; i < count + buffer; i++) {
      arr.push((activeIndex + i + total) % total);
    }
    setDisplayed(arr);
  }, [projects.length, visibleCount, activeIndex]);

  const handlePrev = () => {
    if (isTransitioning) return;
    setSlideDirection("prev");
    setIsTransitioning(true);
  };

  const handleNext = () => {
    if (isTransitioning) return;
    setSlideDirection("next");
    setIsTransitioning(true);
  };

  // Automatyczne przesuwanie karuzeli co 5 sekund (pauza na hover)
  useEffect(() => {
    if (!projects.length) return;
    let paused = false;
    const onMouseEnter = () => (paused = true);
    const onMouseLeave = () => (paused = false);
    const node = carouselRef.current;
    if (node) {
      node.addEventListener("mouseenter", onMouseEnter);
      node.addEventListener("mouseleave", onMouseLeave);
    }
    const interval = setInterval(() => {
      if (!paused && !isTransitioning) handleNext();
    }, 5000);
    return () => {
      clearInterval(interval);
      if (node) {
        node.removeEventListener("mouseenter", onMouseEnter);
        node.removeEventListener("mouseleave", onMouseLeave);
      }
    };
    // eslint-disable-next-line
  }, [projects.length, isTransitioning, visibleCount]);

  // Animacja przesuwania wrappera o szerokość jednego widocznego slotu (płynnie)
  useEffect(() => {
    if (!isTransitioning || !slideDirection) return;
    if (!carouselRef.current) return;
    const wrapper = carouselRef.current;
    const count = Math.min(projects.length, visibleCount);
    const shift = 100 / count; // szerokość jednego widocznego slotu
    wrapper.style.transition = "transform 1.2s cubic-bezier(0.4,0,0.2,1)";
    wrapper.style.transform =
      slideDirection === "next"
        ? `translateX(-${shift}%)`
        : `translateX(${shift}%)`;

    const handle = () => {
      wrapper.style.transition = "none";
      wrapper.style.transform = "translateX(0)";
      setIsTransitioning(false);
      setSlideDirection(null);
      setActiveIndex((prev) => {
        if (slideDirection === "next") {
          return (prev + 1) % projects.length;
        } else {
          return (prev - 1 + projects.length) % projects.length;
        }
      });
      wrapper.removeEventListener("transitionend", handle);
    };
    wrapper.addEventListener("transitionend", handle);
    // eslint-disable-next-line
  }, [isTransitioning, slideDirection]);

  // Calculate centered item index (musi być przed JSX!)
  function getCenteredItemIndex() {
    return Math.floor(visibleCount / 2);
  }

  // Stan ładowania dla każdego slotu karuzeli
  const [loaded, setLoaded] = useState([]);

  // Resetuj loaded jeśli zmienia się liczba projektów lub widocznych slotów
  useEffect(() => {
    setLoaded(Array(displayed.length).fill(false));
  }, [displayed.length, projects.length]);

  // Helper do ładowania obrazka i ustawiania loaded
  function handleImageLoad(idx) {
    setLoaded((prev) => {
      const arr = [...prev];
      arr[idx] = true;
      return arr;
    });
  }

  // Ładowanie obrazków dla slotów karuzeli (każdy slot, także buforowy)
  useEffect(() => {
    displayed.forEach((idx, i) => {
      const imageUrl = getImageUrl(projects[idx]?.mainImage);
      if (imageUrl && !loaded[i]) {
        const img = new window.Image();
        img.onload = () => handleImageLoad(i);
        img.onerror = () => handleImageLoad(i);
        img.src = imageUrl;
      }
    });
    // eslint-disable-next-line
  }, [displayed, projects, loaded]);

  return (
    <section
      id="section4"
      ref={carouselInViewRef}
      className="h-screen w-full flex flex-col items-center justify-center relative bg-black"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        transition: "background-image 0.5s ease-in-out",
      }}
    >
      {/* Additional background layer for smooth transition */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${nextBackgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity:
            nextBackgroundImage && nextBackgroundImage !== backgroundImage
              ? 1
              : 0,
          transition: "opacity 0.5s ease-in-out",
        }}
      />

      <h1 className="text-white text-4xl absolute z-20 top-36 mb-8">
        Projekty
      </h1>

      {/* Carousel Container */}
      <div
        className="w-full max-w-6xl mx-auto absolute"
        style={{
          overflowX: "hidden",
          overflowY: "visible",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        {/* Przyciski nawigacji nad karuzelą - tylko 2! */}
        <div
          style={{
            position: "absolute",
            bottom: "calc(50rem + 24px)", // tuż nad karuzelą
            left: 20,
            zIndex: 30,
          }}
        >
          <div className="button-border-wrapper">
            <button
              onClick={handlePrev}
              className="button-border-content bg-black p-4 rounded-full"
              style={{
                width: 64,
                height: 64,
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseEnter={() => handleNavButtonMouseEnter(0)}
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
              disabled={isTransitioning}
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
                  style={{ transform: "rotate(90deg)" }}
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
                  style={{ transform: "rotate(90deg)" }}
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
            <div className="border-white-glow-top"></div>
            <div className="border-white-glow-right"></div>
            <div className="border-white-glow-bottom"></div>
            <div className="border-white-glow-left"></div>
            <div className="border-line border-purple-1"></div>
            <div className="border-line border-purple-2"></div>
            <div className="border-purple-glow-top"></div>
            <div className="border-purple-glow-right"></div>
            <div className="border-purple-glow-bottom"></div>
            <div className="border-purple-glow-left"></div>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "calc(50rem + 24px)", // tuż nad karuzelą
            right: 20,
            zIndex: 30,
          }}
        >
          <div className="button-border-wrapper">
            <button
              onClick={handleNext}
              className="button-border-content bg-black p-4 rounded-full"
              style={{
                width: 64,
                height: 64,
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseEnter={() => handleNavButtonMouseEnter(1)}
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
              disabled={isTransitioning}
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
                  style={{ transform: "rotate(-90deg)" }}
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
                  style={{ transform: "rotate(-90deg)" }}
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
            <div className="border-white-glow-top"></div>
            <div className="border-white-glow-right"></div>
            <div className="border-white-glow-bottom"></div>
            <div className="border-white-glow-left"></div>
            <div className="border-line border-purple-1"></div>
            <div className="border-line border-purple-2"></div>
            <div className="border-purple-glow-top"></div>
            <div className="border-purple-glow-right"></div>
            <div className="border-purple-glow-bottom"></div>
            <div className="border-purple-glow-left"></div>
          </div>
        </div>

        <div
          ref={carouselRef}
          className="flex"
          style={{
            width: "100%", // wrapper zawsze 100% szerokości kontenera
            // transform i transition obsługiwane przez useEffect
          }}
        >
          {displayed.map((idx, i) => {
            const project = projects[idx];
            if (!project) return null;
            const imageUrl = getImageUrl(project.mainImage);
            return (
              <div
                key={project.id ? `${project.id}-${i}` : i}
                className="flex-shrink-0 p-4 flex items-end justify-center"
                style={
                  i < buffer || i >= displayed.length - buffer
                    ? {
                        width: 0,
                        padding: 0,
                        margin: 0,
                        opacity: 0,
                        pointerEvents: "none",
                        visibility: "hidden",
                        height: "20rem",
                      }
                    : {
                        width: `calc(100% / ${Math.min(
                          projects.length,
                          visibleCount
                        )})`,
                        height: "20rem",
                      }
                }
                onMouseEnter={() => handleCardMouseEnter(i, project)}
                onMouseLeave={() => {
                  setHoveredIndex(null);
                  setNextBackgroundImage(
                    getImageUrl(
                      projects[
                        (activeIndex + getCenteredItemIndex()) % projects.length
                      ]?.mainImage
                    ) || ""
                  );
                }}
              >
                <Link
                  href={`/projects/${project.id}`}
                  className="w-full h-full"
                  style={{ display: "block", height: "100%" }}
                >
                  <div
                    ref={(el) => (borderRefs.current[i] = el)}
                    className={`button-border-scroll glassmorphism w-full h-[14.5rem] flex items-center justify-center relative ${
                      hoveredIndex === i ? "active" : ""
                    } animate-in`}
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
                        <video
                          src="/Loading_WWW.webm"
                          autoPlay
                          loop
                          muted
                          style={{
                            width: 64,
                            height: 64,
                            objectFit: "contain",
                            animation: "spin 1.2s linear infinite",
                            background: "none",
                          }}
                        />
                        <style>{`
                          @keyframes spin { 100% { transform: rotate(360deg); } }
                        `}</style>
                      </div>
                    )}
                    <div
                      className="button-border-content w-full h-full flex flex-col items-center justify-center overflow-hidden cursor-pointer transition-all duration-200"
                      style={{
                        backgroundImage: getImageUrl(project.mainImage)
                          ? `url(${getImageUrl(project.mainImage)})`
                          : undefined,
                        backgroundColor: getImageUrl(project.mainImage)
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
                        className="text-white text-xl bg-black/50 px-4 py-2 rounded"
                        style={{ zIndex: 3, position: "relative" }}
                      >
                        {project.title}
                      </span>
                      {/* Short description on hover */}
                      <div
                        className={`w-full transition-all duration-300 bg-black/70 text-white text-base px-4 py-2 rounded-b absolute left-0 bottom-0 ${
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
                      {!getImageUrl(project.mainImage) && (
                        <span
                          style={{
                            color: "red",
                            fontSize: 10,
                            wordBreak: "break-all",
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: "#fff2",
                            padding: 2,
                          }}
                        >
                          brak obrazka
                          <br />
                          {JSON.stringify(project.mainImage)}
                        </span>
                      )}
                    </div>

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
                </Link>
              </div>
            );
          })}
        </div>

        {/* See All Link - styled and placed directly below carousel */}
        <div className="w-full flex justify-center items-center mt-72 absolute left-0 right-0 z-20">
          <div className="button-border-wrapper">
            <Link
              href="/projects"
              className="button-border-content bg-black px-8 py-4 rounded-full flex items-center justify-center text-white text-lg font-semibold relative overflow-hidden"
              style={{ minWidth: 220, minHeight: 56 }}
              onMouseEnter={() => handleNavButtonMouseEnter(2)}
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
              ref={(el) => (navButtonRefs.current[2] = el)}
            >
              <span className="glitch-text-white">
                Zobacz wszystkie projekty
              </span>
              <span
                className="glitch-text-purple absolute left-0 top-0 w-full h-full flex items-center justify-center pointer-events-none"
                style={{ zIndex: 2 }}
              >
                Zobacz wszystkie projekty
              </span>
            </Link>
            <div className="border-line border-white-1"></div>
            <div className="border-line border-white-2"></div>
            <div className="border-white-glow-top"></div>
            <div className="border-white-glow-right"></div>
            <div className="border-white-glow-bottom"></div>
            <div className="border-white-glow-left"></div>
            <div className="border-line border-purple-1"></div>
            <div className="border-line border-purple-2"></div>
            <div className="border-purple-glow-top"></div>
            <div className="border-purple-glow-right"></div>
            <div className="border-purple-glow-bottom"></div>
            <div className="border-purple-glow-left"></div>
          </div>
        </div>

        {/* Section Navigation Buttons */}
        <div
          className="flex flex-col items-center gap-4 absolute z-30 bottom-10 left-1/2"
          style={{ transform: "translateX(-50%)" }}
        >
          {/* Scroll to section3 button (upwards) */}

          {/* Scroll to section5 button (downwards) */}
          <div
            className="button-border-wrapper"
            ref={(el) => (navButtonRefs.current[1] = el)}
          >
            <button
              onClick={() => scrollToSection("section5")}
              className="button-border-content bg-black p-4 rounded-full"
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseEnter={() => handleNavButtonMouseEnter(1)}
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
            <div className="border-white-glow-top"></div>
            <div className="border-white-glow-right"></div>
            <div className="border-white-glow-bottom"></div>
            <div className="border-white-glow-left"></div>
            <div className="border-line border-purple-1"></div>
            <div className="border-line border-purple-2"></div>
            <div className="border-purple-glow-top"></div>
            <div className="border-purple-glow-right"></div>
            <div className="border-purple-glow-bottom"></div>
            <div className="border-purple-glow-left"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
