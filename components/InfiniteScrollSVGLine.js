// components/InfiniteScrollSVGLine.js
// Seamless, infinite scrolling SVG line for backgrounds
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/**
 * InfiniteScrollSVGLine
 * @param {string} src - SVG image source
 * @param {string} className - CSS class
 * @param {object} style - Inline style
 * @param {string} direction - 'left' or 'right'
 * @param {boolean} isScrolling - If user is scrolling (for speed up)
 * @param {number} svgWidth - Natural SVG width (px)
 * @param {number} svgHeight - SVG height (px)
 * @param {number} scrollSpeed - Normal scroll speed
 * @param {number} scrollSpeedFast - Fast scroll speed (on user scroll)
 * @param {number} scale - Scale factor for SVG (e.g. 0.3 for 30%)
 */
export default function InfiniteScrollSVGLine({
  src,
  className,
  style,
  direction = "left",
  isScrolling,
  svgWidth = 9500, // default to 9500px
  svgHeight = 1020, // default to 1020px
  scrollSpeed = 30,
  scrollSpeedFast = 150,
  scale = 1, // default scale is 1 (100%)
}) {
  // Container ref for possible future use
  const containerRef = useRef(null);
  // Current scroll velocity
  const [velocity, setVelocity] = useState(scrollSpeed);
  // Whether user is scrolling (affects speed)
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  // Calculate scaled dimensions
  const scaledWidth = svgWidth * scale;
  const scaledHeight = svgHeight * scale;
  const numSVGs = 3;

  // Track the leftmost SVG's position (train logic)
  const initialStart = direction === "right" ? -scaledWidth : 0;
  const [start, setStart] = useState(initialStart);

  // Only reset start when direction or scaledWidth changes, not on isScrolling
  useEffect(() => {
    setStart(direction === "right" ? -scaledWidth : 0);
    // eslint-disable-next-line
  }, [direction, scaledWidth]);

  // Update isUserScrolling when prop changes
  useEffect(() => {
    setIsUserScrolling(isScrolling);
  }, [isScrolling]);

  // Animation loop for infinite scroll
  useEffect(() => {
    let animationFrame;
    let prevTimestamp = null;
    let currentVelocity = velocity;
    let targetVelocity = isUserScrolling ? scrollSpeedFast : scrollSpeed;
    const ACCEL = 200; // px/s^2
    function animate(ts) {
      if (!prevTimestamp) prevTimestamp = ts;
      const dt = (ts - prevTimestamp) / 1000;
      prevTimestamp = ts;
      // Smooth acceleration/deceleration
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
      setStart((prevStart) => {
        let nextStart =
          prevStart + (direction === "left" ? -1 : 1) * currentVelocity * dt;
        if (direction === "left" && nextStart <= -scaledWidth) {
          return nextStart + scaledWidth;
        } else if (direction === "right" && nextStart >= 0) {
          return nextStart - scaledWidth;
        }
        return nextStart;
      });
      animationFrame = requestAnimationFrame(animate);
    }
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
    // eslint-disable-next-line
  }, [
    isUserScrolling,
    direction,
    scrollSpeed,
    scrollSpeedFast,
    svgWidth,
    scaledWidth,
  ]);

  // Render 3 SVGs, always spaced exactly scaledWidth apart, snap to integer pixel
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
        height: scaledHeight, // use scaled height
        zIndex: 0,
      }}
    >
      <div
        style={{
          position: "relative",
          width: scaledWidth * numSVGs,
          height: "100%",
        }}
      >
        {Array.from({ length: numSVGs }).map((_, i) => (
          <Image
            key={i}
            src={src}
            alt="scrolling-svg"
            style={{
              position: "absolute",
              left: start + i * scaledWidth,
              top: 0,
              height: "100%",
              width: scaledWidth, // Force exact width
              opacity: 1,
              pointerEvents: "none",
              display: "block",
              transition: "none",
            }}
            draggable={false}
          />
        ))}
      </div>
    </div>
  );
}
