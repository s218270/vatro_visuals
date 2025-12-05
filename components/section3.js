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
  const contentRef = useRef(null);
  const imageRef = useRef(null);
  const omnieRef = useRef(null);
  const toolsRef = useRef(null);
  const leftWrapRef = useRef(null);
  const rightWrapRef = useRef(null);

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

  // Position columns so the gap between them sits at the viewport center on large screens.
  useEffect(() => {
    if (!contentRef.current || !leftWrapRef.current || !rightWrapRef.current)
      return;

    // try to read the gap from CSS (column-gap) for resiliency; fall back to gap-8 (32px)
    let gap = 32;
    try {
      const cs = getComputedStyle(contentRef.current);
      const colGap =
        cs.getPropertyValue("column-gap") || cs.getPropertyValue("gap");
      if (colGap) {
        // parse px value
        const m = colGap.match(/([0-9.]+)px/);
        if (m) gap = parseFloat(m[1]);
      }
    } catch (e) {
      // ignore and use fallback
      gap = 48;
    }

    function applyPositioning() {
      const vw = window.innerWidth;
      const isDesktop = vw >= 1024;
      const contentRect = contentRef.current.getBoundingClientRect();

      const leftEl = leftWrapRef.current;
      const rightEl = rightWrapRef.current;

      // Reset styles for mobile
      if (!isDesktop) {
        leftEl.style.position = "";
        leftEl.style.left = "";
        leftEl.style.top = "";
        leftEl.style.transform = "";
        leftEl.style.boxSizing = "";
        leftEl.style.width = "";

        rightEl.style.position = "";
        rightEl.style.left = "";
        rightEl.style.top = "";
        rightEl.style.transform = "";
        rightEl.style.boxSizing = "";
        rightEl.style.width = "";
        rightEl.style.maxWidth = "";
        rightEl.style.overflow = "";
        rightEl.style.fontSize = "";

        // ensure container uses normal flow
        contentRef.current.style.height = "";
        return;
      }

      // Measure widths
      const leftWidth = leftEl.getBoundingClientRect().width;
      const rightWidth = rightEl.getBoundingClientRect().width;

      // viewport center
      const centerX = vw / 2;

      // compute left column left position so that (left + leftWidth + gap/2) == centerX
      const desiredLeftPageX = centerX - leftWidth - gap / 2;
      const desiredRightPageX = centerX + gap / 2;

      // compute positions relative to content container
      const contentLeft = contentRect.left + window.scrollX;
      const leftRel = desiredLeftPageX - contentRect.left;
      const rightRel = desiredRightPageX - contentRect.left;

      // compute available width for right column inside content based on left column position
      const leftRelClamped = Math.max(leftRel, 0);
      // remaining space after left column and gap
      const remaining =
        contentRect.width - (leftRelClamped + leftWidth + gap) - 16;
      const availableWidth = Math.max(300, remaining); // enforce a larger min width to prevent overflow

      // Apply absolute positioning
      leftEl.style.position = "absolute";
      leftEl.style.top = "0";
      leftEl.style.left = `${Math.max(leftRel, 0)}px`;
      leftEl.style.transform = "none";

      rightEl.style.position = "absolute";
      rightEl.style.top = "0";
      rightEl.style.left = `${Math.max(rightRel, 0)}px`;
      // constrain right column width so it fits into the content container
      rightEl.style.boxSizing = "border-box";
      rightEl.style.width = `${availableWidth}px`;
      rightEl.style.maxWidth = `${availableWidth}px`;
      // do NOT hide overflow — we will adjust font sizes to make content fit instead
      rightEl.style.overflow = "visible";
      // Small-breakpoint tweak: 1024-1279px increase font slightly (user-requested +1 size)
      try {
        if (vw >= 1024 && vw <= 1279) {
          const csRight = getComputedStyle(rightEl);
          const baseFont = parseFloat(csRight.fontSize.replace("px", "")) || 16;
          // increase by ~8% but cap the increase to +2px so it doesn't blow layout
          const increased = Math.min(baseFont * 1.08, baseFont + 2);
          rightEl.style.fontSize = `${increased}px`;
        } else {
          // reset for other sizes (desktop large will be tuned by reduction loop below)
          rightEl.style.fontSize = "";
        }
      } catch (e) {
        // ignore
      }
      // enforce fixed gap between About and Tools to match column gutter
      rightEl.style.display = "flex";
      rightEl.style.flexDirection = "column";
      rightEl.style.gap = `${gap}px`;

      // Ensure right column matches left column height (so the gap between About and Tools is stable)
      try {
        const leftHeight = leftEl.getBoundingClientRect().height;
        rightEl.style.height = `${leftHeight}px`;
        rightEl.style.maxHeight = `${leftHeight}px`;
      } catch (e) {
        // ignore
      }

      // Make the AboutCard (first child of rightEl) grow to fill the space above ToolsCard
      try {
        const aboutEl = rightEl.children && rightEl.children[0];
        const toolsEl = rightEl.children && rightEl.children[1];
        if (aboutEl) {
          aboutEl.style.flex = "1 1 auto";
          aboutEl.style.minHeight = "0"; // allow it to shrink properly
          aboutEl.style.overflow = "hidden";
        }
        if (toolsEl) {
          // keep tools fixed height (already inline in JSX), but ensure it doesn't stretch
          toolsEl.style.flex = "0 0 auto";
        }
      } catch (e) {
        // ignore
      }

      // If AboutCard text overflows horizontally or vertically at narrow desktop widths,
      // reduce the paragraph font-size inside the right column until it fits or reaches min size.
      try {
        const aboutP = rightEl.querySelector("p");
        if (aboutP) {
          aboutP.style.wordBreak = "break-word";
          aboutP.style.overflowWrap = "break-word";
          // read current computed font-size (px)
          const cs = getComputedStyle(aboutP);
          let current = parseFloat(cs.fontSize.replace("px", "")) || 16;
          const minPx = 14; // minimum font size in px
          let iter2 = 0;
          function aboutFits() {
            // check p width and height against the AboutCard area (first child of rightEl)
            const aboutArea = rightEl.children && rightEl.children[0];
            if (!aboutArea) return true;
            return (
              aboutP.scrollWidth <= aboutArea.clientWidth + 1 &&
              aboutP.scrollHeight <= aboutArea.clientHeight + 1
            );
          }
          // Reset any previous inline font-size to start fresh (but preserve rightEl size tweak)
          aboutP.style.fontSize = "";
          // If it doesn't fit, reduce stepwise
          while (!aboutFits() && iter2 < 10 && current > minPx) {
            iter2++;
            current = Math.max(minPx, current * 0.94);
            aboutP.style.fontSize = `${current}px`;
          }
        }
      } catch (e) {
        // ignore errors
      }
      rightEl.style.transform = "none";

      // ensure content wrapper is tall enough to contain absolute children
      const desiredHeight = leftEl.getBoundingClientRect().height;
      // set the content height to match the left column (which is the image column)
      contentRef.current.style.height = `${desiredHeight}px`;

      // If right column overflows, gently reduce font-size (only on desktop)
      // so content fits into availableWidth/desiredHeight. Clamp minimum font-size.
      const minFont = 0.85; // rem
      const maxIterations = 8;
      let iter = 0;
      function fits() {
        return (
          rightEl.scrollWidth <= rightEl.clientWidth + 1 &&
          rightEl.scrollHeight <= rightEl.clientHeight + 1
        );
      }
      // read current font-size in rem-ish (assume 16px base)
      let currentFont = parseFloat(
        getComputedStyle(rightEl).fontSize.replace("px", "")
      );
      const basePx = 16;
      while (!fits() && iter < maxIterations) {
        iter++;
        currentFont = Math.max(minFont * basePx, currentFont * 0.95);
        rightEl.style.fontSize = `${currentFont}px`;
        // reflow measurements
        // eslint-disable-next-line no-unused-expressions
        rightEl.offsetHeight;
        if (currentFont <= minFont * basePx) break;
      }
    }

    applyPositioning();
    let t = null;
    function onResize() {
      clearTimeout(t);
      t = setTimeout(applyPositioning, 80);
    }
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(t);
    };
  }, [contentRef, leftWrapRef, rightWrapRef]);

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
        src="/Text_Outlines.svg"
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
        src="/Text_Outlines.svg"
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
        id="section3-content"
        ref={contentRef}
        className="w-full xl:max-w-[1400px] lg:max-w-[1200px] md:max-w-[900px] sm:max-w-[80%] max-w-[95%] mx-auto relative flex flex-col lg:flex-row items-stretch gap-8 py-[120px] min-h-[600px] h-full lg:h-[80vh]"
        style={{ minHeight: 600 }}
      >
        {/* Image: left column. On mobile it behaves as before, on lg it keeps portrait 9:16 ratio */}
        <div
          ref={leftWrapRef}
          className="section3-image-wrap flex-shrink-0 w-full h-[40vh] lg:h-[60vh] flex items-stretch justify-center"
        >
          <ImageCard inView={inViewImage} imageRef={imageRef} />
        </div>

        {/* Right column: description + tools - takes remaining space */}
        <div
          ref={rightWrapRef}
          className="section3-right flex flex-col flex-1 gap-8 lg:justify-between h-[40vh] lg:h-[60vh] max-h-[60vh]"
        >
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
