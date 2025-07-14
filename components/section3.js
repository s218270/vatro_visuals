"use client";
import { useEffect, useRef, useState } from "react";
import ToolsList from "./ToolsList";
import AnimatedText from "./AnimatedText";
import useInView from "../lib/useInView";
import InfiniteScrollSVGLine from "./InfiniteScrollSVGLine";
import ImageCard from "./ImageCard";
import AboutCard from "./AboutCard";
import ToolsCard from "./ToolsCard";
import GlitchButton from "./GlitchButton";

// Section3: Main About/Tools/Animated SVG section
// Handles layout, in-view animations, and background SVG lines
export default function Section3({ speed, scrollToSection }) {
  // Refs for in-view detection
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const omnieRef = useRef(null);
  const toolsRef = useRef(null);

  // In-view states for animated appearance
  const inViewImage = useInView(imageRef, 120);
  const inViewOmnie = useInView(omnieRef, 120);
  const inViewTools = useInView(toolsRef, 120);

  // Reset border/glow animation on in/out of view
  useEffect(() => {
    const el = imageRef.current;
    if (!el) return;
    if (inViewImage) {
      el.classList.remove("active");
      requestAnimationFrame(() => {
        el.classList.add("active");
      });
    } else {
      el.classList.remove("active");
    }
  }, [inViewImage]);
  useEffect(() => {
    const el = omnieRef.current;
    if (!el) return;
    if (inViewOmnie) {
      el.classList.remove("active");
      requestAnimationFrame(() => {
        el.classList.add("active");
      });
    } else {
      el.classList.remove("active");
    }
  }, [inViewOmnie]);
  useEffect(() => {
    const el = toolsRef.current;
    if (!el) return;
    if (inViewTools) {
      el.classList.remove("active");
      requestAnimationFrame(() => {
        el.classList.add("active");
      });
    } else {
      el.classList.remove("active");
    }
  }, [inViewTools]);

  // User scroll detection for speeding up SVG lines
  const [isScrolling, setIsScrolling] = useState(false);
  useEffect(() => {
    let timeoutId;
    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIsScrolling(false), 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  // Animation duration for glitch button (not used for SVGs)
  const animDuration = isScrolling ? "200s" : "750s";

  return (
    <section
      id="section3"
      className="min-h-[1000px] w-full bg-black flex flex-col items-center justify-center relative overflow-hidden h-auto lg:h-screen"
      ref={containerRef}
    >
      {/* Gradient overlays for top/bottom fade */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "30vh",
          zIndex: 1,
          pointerEvents: "none",
          background: "linear-gradient(to bottom, #000 0%, transparent 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100vw",
          height: "30vh",
          zIndex: 0,
          pointerEvents: "none",
          background: "linear-gradient(to top, #000 0%, transparent 100%)",
        }}
      />
      {/* Top set of animated background SVG lines */}
      <InfiniteScrollSVGLine
        src="/WWW Text_Fill.svg"
        className="vatro-bg-svg vatroline"
        direction="left" // Opposite direction from first set
        svgWidth={9500}
        svgHeight={1020}
        scale={0.5}
        style={{
          top: "7vh",
          left: 0,
          position: "absolute",
          opacity: 0.4,
          zIndex: 2,
        }}
        isScrolling={isScrolling}
      />
      <InfiniteScrollSVGLine
        src="/vatro_visuals_outline.svg"
        className="vatro-bg-svg visualsline"
        direction="right" // Opposite direction from first set
        svgWidth={9500}
        svgHeight={1020}
        scale={0.6}
        style={{
          top: "calc(7vh - 150px)",
          right: 0,
          position: "absolute",
          opacity: 0.7,
          zIndex: 2,
        }}
        isScrolling={isScrolling}
      />
      {/* Animated background SVG lines (bottom set) */}
      {/* Top line: center SVG at left: 0, scrolls right */}
      <InfiniteScrollSVGLine
        src="/WWW Text_Fill.svg"
        className="vatro-bg-svg vatroline"
        direction="right"
        svgWidth={9500}
        svgHeight={1020}
        scale={0.5}
        style={{
          bottom: "calc(7vh - 50px)",
          left: 0,
          position: "absolute",
          opacity: 0.4,
          zIndex: 2,
        }}
        isScrolling={isScrolling}
      />
      {/* Bottom line: center SVG at right: 0, scrolls left */}
      <InfiniteScrollSVGLine
        src="/vatro_visuals_outline.svg"
        className="vatro-bg-svg visualsline"
        direction="left"
        svgWidth={9500}
        svgHeight={1020}
        scale={0.6}
        style={{
          bottom: "7vh",
          right: 0,
          position: "absolute",
          opacity: 0.7,
          zIndex: 2,
        }}
        isScrolling={isScrolling}
      />

      {/* Responsive Grid Layout */}
      <div
        className="w-full max-w-[80%] mx-auto grid grid-cols-1 grid-rows-[1fr_1fr_1fr] gap-8 lg:grid-cols-3 lg:grid-rows-2 lg:gap-8 items-stretch py-[50px]"
        style={{
          // On large screens, max height is 80vh
          ...(typeof window !== "undefined" && window.innerWidth >= 1024
            ? { maxHeight: "90vh" }
            : {}),
        }}
      >
        {/* Image: col 1, row 1-2 on lg, row 1 on mobile */}
        <ImageCard inView={inViewImage} imageRef={imageRef} />
        {/* O mnie: col 2-3, row 1 on lg */}
        <AboutCard inView={inViewOmnie} omnieRef={omnieRef} />
        {/* Tools: col 2-3, row 2 on lg */}
        <ToolsCard inView={inViewTools} toolsRef={toolsRef} />
      </div>
      {/* Button with glitch animation reset on hover */}
      {/* <GlitchButton scrollToSection={scrollToSection} /> */}
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
          onClick={() => scrollToSection("section4")}
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
      {/* Radial fade below the section */}
      <div
        style={{
          position: "absolute",
          overflow: "visible",
          left: "50%",
          bottom: "-60vh", // Place below the bottom of the section
          transform: "translateX(-50%)",
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
          zIndex: 0,
          background:
            "radial-gradient(ellipse at center, #7802ab 0%, transparent 70%)",
        }}
      />
    </section>
  );
}
