"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import ToolsList from "./ToolsList";
import AnimatedText from "./AnimatedText";

function useInView(ref, offset = 200) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    function onScroll() {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const isVisible =
        rect.top < window.innerHeight - offset && rect.bottom > offset;
      setInView(isVisible);
    }
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [ref, offset]);
  return inView;
}

// InfiniteScrollText: seamless, non-jumping, customizable text line
function InfiniteScrollText({
  text,
  className,
  style,
  direction = "left",
  hollow = false,
  scrollSpeed = 30,
  scrollSpeedFast = 120,
  isScrolling,
}) {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [offset, setOffset] = useState(0);
  const [velocity, setVelocity] = useState(scrollSpeed);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [textWidth, setTextWidth] = useState(0);

  // Measure the width of a single text block
  useEffect(() => {
    if (textRef.current) {
      setTextWidth(textRef.current.offsetWidth);
    }
  }, [text]);

  // Set initial offset for direction="right" after textWidth is known
  useEffect(() => {
    if (direction === "right" && textWidth) {
      setOffset(-textWidth);
    } else if (direction === "left") {
      setOffset(0);
    }
  }, [direction, textWidth]);

  useEffect(() => {
    setIsUserScrolling(isScrolling);
  }, [isScrolling]);

  useEffect(() => {
    let animationFrame;
    let prevTimestamp = null;
    let currentVelocity = velocity;
    let targetVelocity = isUserScrolling ? scrollSpeedFast : scrollSpeed;
    const ACCEL = 200; // px/sec^2, how fast to accelerate

    function animate(ts) {
      if (!prevTimestamp) prevTimestamp = ts;
      const dt = (ts - prevTimestamp) / 1000; // seconds
      prevTimestamp = ts;
      // Smoothly approach target velocity
      if (currentVelocity < targetVelocity) {
        currentVelocity = Math.min(
          currentVelocity + ACCEL * dt,
          targetVelocity
        );
      } else if (currentVelocity > targetVelocity) {
        currentVelocity = Math.max(
          currentVelocity - ACCEL * dt,
          targetVelocity
        );
      }
      setVelocity(currentVelocity);
      // Move offset
      setOffset((prev) => {
        let next =
          prev + (direction === "left" ? -1 : 1) * currentVelocity * dt;
        if (textWidth) {
          if (direction === "left") {
            if (next <= -textWidth) next += textWidth;
          } else {
            if (next >= textWidth) next -= textWidth;
          }
        }
        return next;
      });
      animationFrame = requestAnimationFrame(animate);
    }
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
    // eslint-disable-next-line
  }, [isUserScrolling, direction, scrollSpeed, scrollSpeedFast, textWidth]);

  // Render two copies for seamless loop
  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        ...style,
        overflow: "hidden",
        width: "100vw",
        minWidth: "100vw",
        pointerEvents: "none",
        userSelect: "none",
        position: style?.position || "absolute",
      }}
    >
      <div
        style={{
          display: "inline-block",
          whiteSpace: "nowrap",
          willChange: "transform",
          transform: `translateX(${offset}px)`,
        }}
      >
        {hollow ? (
          <span
            ref={textRef}
            style={{
              color: "transparent",
              WebkitTextStroke: "14px #fff",
              textStroke: "8px #fff",
              fontWeight: 900,
              opacity: 0.5,
              fontSize: style?.fontSize,
              fontFamily: style?.fontFamily,
              lineHeight: 1,
              // Alternatywnie, jeśli chcesz efekt shadow zamiast stroke, odkomentuj poniżej:
              // textShadow: `0 0 2px #fff, 0 0 4px #fff, 0 0 8px #fff, 0 0 12px #fff, 0 0 16px #fff, 0 0 20px #fff, 0 0 24px #fff, 0 0 28px #fff`,
            }}
          >
            {text.repeat(150)}
          </span>
        ) : (
          <>
            <span
              ref={textRef}
              style={{
                color: "#fff",
                fontWeight: 500,
                opacity: 0.5,
                filter: "blur(0.5px)",
                fontSize: style?.fontSize,
                fontFamily: style?.fontFamily,
              }}
            >
              {text.repeat(150)}
            </span>
            <span
              style={{
                color: "#fff",
                fontWeight: 500,
                opacity: 0.5,
                filter: "blur(0.5px)",
                fontSize: style?.fontSize,
                fontFamily: style?.fontFamily,
              }}
            >
              {text.repeat(150)}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

export default function Section3({ speed, scrollToSection }) {
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const omnieRef = useRef(null);
  const toolsRef = useRef(null);

  const inViewImage = useInView(imageRef, 120);
  const inViewOmnie = useInView(omnieRef, 120);
  const inViewTools = useInView(toolsRef, 120);

  // --- RESET ANIMACJI BORDERÓW/Glow przy szybkim wejściu/wyjściu z widoku ---
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

  // Scroll speed-up logic
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

  const animDuration = isScrolling ? "200s" : "750s";

  return (
    <section
      id="section3"
      className="min-h-[1000px] w-full bg-black flex flex-col items-center justify-center relative overflow-hidden h-auto lg:h-screen"
      ref={containerRef}
    >
      {/* Gradient overlay at the top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "30vh",
          zIndex: 10,
          pointerEvents: "none",
          background: "linear-gradient(to bottom, #000 0%, transparent 100%)",
        }}
      />
      {/* Gradient overlay at the bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100vw",
          height: "30vh",
          zIndex: 10,
          pointerEvents: "none",
          background: "linear-gradient(to top, #000 0%, transparent 100%)",
        }}
      />
      {/* Animated background text lines */}
      {/* VATRO line: scrolls right, 5% from top, starts at left: 0 */}
      <InfiniteScrollText
        text={"_VATRO"}
        className="vatro-bg-text vatroline"
        direction="right"
        style={{
          fontSize: "60vh", // 60% wysokości sekcji
          fontWeight: 500,
          color: "#fff",
          top: "-15vh", // wychodzi ponad sekcję
          left: 0,
          position: "absolute",
          opacity: 0.5,
          zIndex: 0,
          lineHeight: 1,
        }}
        isScrolling={isScrolling}
      />
      {/* VISUALS line (hollow/outline, leading underscore): scrolls left, 5% from bottom, starts at right: 0 */}
      <InfiniteScrollText
        text={"_VISUALS"}
        className="vatro-bg-text visualsline"
        direction="left"
        hollow={true}
        style={{
          fontSize: "60vh", // 60% wysokości sekcji
          fontWeight: 900,
          color: "transparent",
          WebkitTextStroke: "2px #fff", // cienki outline
          textStroke: "2px #fff",
          bottom: "-15vh", // wychodzi pod sekcję
          right: 0,
          position: "absolute",
          opacity: 0.5,
          zIndex: 0,
          lineHeight: 1,
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
        <div
          ref={imageRef}
          className={`button-border-scroll border-3x-slow p-[2px] portrait-lg glassmorphism w-full h-full max-w-full max-h-full sm:max-h-[450px] md:max-h-[400px] lg:row-span-2 lg:col-span-1 lg:w-full lg:h-full lg:max-w-full lg:max-h-full${
            inViewImage ? " active" : ""
          }`}
          style={{
            position: "relative",
            minHeight: 0,
            minWidth: 0,
            height: "100%",
            borderRadius: 3,
            opacity: inViewImage ? 1 : 0,
            transition: "opacity 0.7s, transform 0.7s",
            transform:
              typeof window !== "undefined" && window.innerWidth >= 1024
                ? inViewImage
                  ? "translateX(0)"
                  : "translateX(-80px)"
                : inViewImage
                ? "translateX(0)"
                : "translateX(-60px)",
          }}
        >
          <img
            src="Andrew.webp"
            alt="Andrew"
            className="button-border-content w-full h-full object-cover"
            style={{
              objectFit: "cover",
              width: "calc(100% - 4px)", // odsunięcie od borderów
              height: "calc(100% - 4px)",
              minHeight: 0,
              minWidth: 0,
              background: "#111",
              opacity: 1,
              borderRadius: "3px",
              position: "relative",
              zIndex: 2,
            }}
          />
          <div
            className="border-line border-white-1"
            style={{ borderTopWidth: "4px", borderLeftWidth: "4px" }}
          ></div>
          <div
            className="border-line border-white-2"
            style={{ borderBottomWidth: "4px", borderRightWidth: "4px" }}
          ></div>
          {/* White Glow */}
          <div
            className="border-white-glow-top"
            style={{ height: "4px" }}
          ></div>
          <div
            className="border-white-glow-right"
            style={{ width: "4px" }}
          ></div>
          <div
            className="border-white-glow-bottom"
            style={{ height: "4px" }}
          ></div>
          <div
            className="border-white-glow-left"
            style={{ width: "4px" }}
          ></div>
          <div
            className="border-line border-purple-1"
            style={{ borderTopWidth: "4px", borderLeftWidth: "4px" }}
          ></div>
          <div
            className="border-line border-purple-2"
            style={{ borderBottomWidth: "4px", borderRightWidth: "4px" }}
          ></div>
          {/* Purple Glow */}
          <div
            className="border-purple-glow-top"
            style={{ height: "4px" }}
          ></div>
          <div
            className="border-purple-glow-right"
            style={{ width: "4px" }}
          ></div>
          <div
            className="border-purple-glow-bottom"
            style={{ height: "4px" }}
          ></div>
          <div
            className="border-purple-glow-left"
            style={{ width: "4px" }}
          ></div>
        </div>

        {/* O mnie: col 2-3, row 1 on lg */}
        <div
          ref={omnieRef}
          className={`button-border-scroll border-3x-slow glassmorphism w-full max-w-full sm:max-h-[450px] md:max-h-[400px]${
            inViewOmnie ? " active" : ""
          } lg:col-span-2 lg:row-span-1 flex flex-col`}
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            maxWidth: "100%",
            borderRadius: 3,
            opacity: inViewOmnie ? 1 : 0,
            transition: "opacity 0.7s, transform 0.7s",
            transform:
              typeof window !== "undefined" && window.innerWidth >= 1024
                ? inViewOmnie
                  ? "translateX(0)"
                  : "translateX(80px)"
                : inViewOmnie
                ? "translateX(0)"
                : "translateX(60px)",
          }}
        >
          <h2
            className={inViewOmnie ? "appear" : ""}
            style={{
              margin: 0,
              marginTop: 20,
              marginLeft: 35,
              marginBottom: 20,
              padding: 0,
              fontWeight: 700,
              fontSize: "1.5rem",
              color: "#f2f2f2",
              textAlign: "left",
            }}
          >
            <AnimatedText text="O mnie" inView={inViewOmnie} as="span" />
          </h2>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <p
              className={`button-border-content text-xl bg-black text-[#f2f2f2] p-6 w-full overflow-auto ${
                inViewOmnie ? "appear" : ""
              }`}
              style={{
                marginTop: 0,
                textAlign: "center",
                minHeight: 0,
                minWidth: 0,
                wordBreak: "break-word",
                whiteSpace: "normal",
              }}
            >
              <AnimatedText
                text="Jestem Andrew Tate, były mistrz świata w kickboxingu, przedsiębiorca i twórca treści motywacyjnych. Znany z mojego pewnego siebie podejścia do życia i kontrowersyjnych poglądów, inspiruję ludzi, by dążyli do osiągnięcia sukcesu w każdej dziedzinie. Moje życie to połączenie dyscypliny, ciężkiej pracy i luksusu, które pokazuję, by motywować innych do wyjścia poza swoje granice."
                inView={inViewOmnie}
                as="span"
                letterDelay={0.012}
              />
            </p>
          </div>
          <div
            className="border-line border-white-1"
            style={{ borderTopWidth: "4px", borderLeftWidth: "4px" }}
          ></div>
          <div
            className="border-line border-white-2"
            style={{ borderBottomWidth: "4px", borderRightWidth: "4px" }}
          ></div>
          {/* White Glow */}
          <div
            className="border-white-glow-top"
            style={{ height: "4px" }}
          ></div>
          <div
            className="border-white-glow-right"
            style={{ width: "4px" }}
          ></div>
          <div
            className="border-white-glow-bottom"
            style={{ height: "4px" }}
          ></div>
          <div
            className="border-white-glow-left"
            style={{ width: "4px" }}
          ></div>
          <div
            className="border-line border-purple-1"
            style={{ borderTopWidth: "4px", borderLeftWidth: "4px" }}
          ></div>
          <div
            className="border-line border-purple-2"
            style={{ borderBottomWidth: "4px", borderRightWidth: "4px" }}
          ></div>
          {/* Purple Glow */}
          <div
            className="border-purple-glow-top"
            style={{ height: "4px" }}
          ></div>
          <div
            className="border-purple-glow-right"
            style={{ width: "4px" }}
          ></div>
          <div
            className="border-purple-glow-bottom"
            style={{ height: "4px" }}
          ></div>
          <div
            className="border-purple-glow-left"
            style={{ width: "4px" }}
          ></div>
        </div>

        {/* Tools: col 2-3, row 2 on lg */}
        <div
          ref={toolsRef}
          className={`button-border-scroll border-3x-slow glassmorphism w-full max-w-full sm:max-h-[450px] md:max-h-[400px]${
            inViewTools ? " active" : ""
          } lg:col-span-2 lg:row-span-1 flex flex-col`}
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            maxWidth: "100%",
            borderRadius: 3,
            opacity: inViewTools ? 1 : 0,
            transition: "opacity 0.7s, transform 0.7s",
            transform:
              typeof window !== "undefined" && window.innerWidth >= 1024
                ? inViewTools
                  ? "translateX(0)"
                  : "translateX(80px)"
                : inViewTools
                ? "translateX(0)"
                : "translateX(-60px)",
          }}
        >
          <h3
            className={inViewTools ? "appear" : ""}
            style={{
              marginTop: 20,
              marginLeft: 35,
              color: "#f2f2f2",
              fontWeight: 700,
              fontSize: "1.5rem",
              marginBottom: 20,
              textAlign: "left",
              opacity: 1,
            }}
          >
            <AnimatedText text="Narzędzia" inView={inViewTools} as="span" />
          </h3>
          <ToolsList inView={inViewTools} />
          <div
            className="border-line border-white-1"
            style={{ borderTopWidth: "4px", borderLeftWidth: "4px" }}
          ></div>
          <div
            className="border-line border-white-2"
            style={{ borderBottomWidth: "4px", borderRightWidth: "4px" }}
          ></div>
          {/* White Glow */}
          <div
            className="border-white-glow-top"
            style={{ height: "4px" }}
          ></div>
          <div
            className="border-white-glow-right"
            style={{ width: "4px" }}
          ></div>
          <div
            className="border-white-glow-bottom"
            style={{ height: "4px" }}
          ></div>
          <div
            className="border-white-glow-left"
            style={{ width: "4px" }}
          ></div>
          <div
            className="border-line border-purple-1"
            style={{ borderTopWidth: "4px", borderLeftWidth: "4px" }}
          ></div>
          <div
            className="border-line border-purple-2"
            style={{ borderBottomWidth: "4px", borderRightWidth: "4px" }}
          ></div>
          {/* Purple Glow */}
          <div
            className="border-purple-glow-top"
            style={{ height: "4px" }}
          ></div>
          <div
            className="border-purple-glow-right"
            style={{ width: "4px" }}
          ></div>
          <div
            className="border-purple-glow-bottom"
            style={{ height: "4px" }}
          ></div>
          <div
            className="border-purple-glow-left"
            style={{ width: "4px" }}
          ></div>
        </div>
      </div>

      {/* Button with glitch animation reset on hover */}
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
          onClick={() => scrollToSection("section4")}
          className="button-border-content bg-black p-4 rounded-full"
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseEnter={(e) => {
            const purple = e.currentTarget.querySelector(".glitch-text-purple");
            if (!purple) return;
            purple.classList.remove("glitch-done", "glitch-out");
            void purple.offsetWidth;
            purple.classList.add("glitch-done");
          }}
          onMouseLeave={(e) => {
            const purple = e.currentTarget.querySelector(".glitch-text-purple");
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
    </section>
  );
}
