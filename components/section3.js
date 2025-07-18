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
      className="min-h-screen w-full bg-[#080808] flex flex-col items-center justify-center relative overflow-hidden z-10"
      ref={containerRef}
    >
      {/* Gradient overlays for top/bottom fade */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "30vh",
          zIndex: 1,
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
          zIndex: 1,
          pointerEvents: "none",
          background: "linear-gradient(to top, #080808 0%, transparent 100%)",
        }}
      />
      {/* Top set of animated background SVG lines */}
      <InfiniteScrollSVGLine
        src="/WWW Text_Fill (1).svg"
        className="vatro-bg-svg vatroline"
        direction="left" // Opposite direction from first set
        svgWidth={9500}
        svgHeight={1020}
        width={9500}
        height={1020}
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
        src="/WWW Text_Outlines (2).svg"
        className="vatro-bg-svg visualsline"
        direction="right" // Opposite direction from first set
        svgWidth={9500}
        svgHeight={1020}
        width={9500}
        height={1020}
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
        src="/WWW Text_Fill (1).svg"
        className="vatro-bg-svg vatroline"
        direction="right"
        svgWidth={9500}
        svgHeight={1020}
        width={9500}
        height={1020}
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
        src="/WWW Text_Outlines (2).svg"
        className="vatro-bg-svg visualsline"
        direction="left"
        svgWidth={9500}
        svgHeight={1020}
        width={9500}
        height={1020}
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
        className="w-full xl:max-w-[70%] lg:max-w-[75%] md:max-w-[80%] sm:max-w-[90%] max-w-[95%] mx-auto flex flex-col lg:flex-row items-stretch gap-8 py-[120px] min-h-[600px] h-full lg:h-[80vh]"
        style={{ minHeight: 600 }}
      >
        {/* Image: col 1, row 1-2 on lg, row 1 on mobile */}
        <ImageCard inView={inViewImage} imageRef={imageRef} />
        <div className="flex flex-col flex-1 gap-8 max-h-[80vh] lg:max-h-full">
          {/* O mnie: col 2-3, row 1 on lg */}
          <AboutCard inView={inViewOmnie} omnieRef={omnieRef} />
          {/* Tools: col 2-3, row 2 on lg */}
          <div
            style={{
              height: 150,
              minHeight: 150,
              maxHeight: 150,
              width: "100%",
            }}
          >
            <ToolsCard inView={inViewTools} toolsRef={toolsRef} />
          </div>
        </div>
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
      {/* Radial fade below the section */}
      <div
        style={{
          position: "absolute",
          overflow: "visible",
          left: "50%",
          bottom: "-60vh", // Place below the bottom of the section
          transform: "translateX(-50%)",
          width: "100%",
          height: "100vh",
          pointerEvents: "none",
          zIndex: 0,
          background:
            "radial-gradient(ellipse at center, #7802ab 0%, transparent 65%)",
        }}
      />
    </section>
  );
}
