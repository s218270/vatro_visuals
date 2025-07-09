// lib/useInView.js
// Custom React hook to detect if a ref is in the viewport (with offset)
import { useEffect, useState } from "react";

/**
 * useInView - Hook to check if an element is in the viewport
 * @param {React.RefObject} ref - The ref to observe
 * @param {number} offset - Offset in px from viewport edge
 * @returns {boolean} - True if in view
 */
export default function useInView(ref, offset = 200) {
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
