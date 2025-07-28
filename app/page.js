"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Section5 from "../components/section5";
import LogoAnimation from "@/components/LogoAnimation";
import { getProjects } from "../lib/getProjects";

// Dynamic imports for heavy sections
const Section3 = dynamic(() => import("../components/section3"), {
  ssr: false,
});
const Section4 = dynamic(() => import("../components/section4"), {
  ssr: false,
});

export default function Home() {
  const [speed, setSpeed] = useState(20);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isIOS, setIsIOS] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  const searchParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;

  // Usunięto params z zewnętrznego scope

  // Toggle menu function
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const scrollToSection = (id) => {
    if (!id) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setIsMenuOpen(false);
      return;
    }
    const section = document.getElementById(id);
    if (!section) {
      // Optionally: warn in dev only
    } else {
      // Force scroll using window.scrollTo for reliability
      const y = section.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleScrollResize = () => {
      const scrollSpeed = Math.max(5, 50 - window.scrollY / 150);
      setSpeed(scrollSpeed);
    };

    window.addEventListener("scroll", handleScrollResize);
    window.addEventListener("resize", handleScrollResize);
    // Call once to set initial state on mount
    handleScrollResize();
    return () => {
      window.removeEventListener("scroll", handleScrollResize);
      window.removeEventListener("resize", handleScrollResize);
    };
  }, []);

  useEffect(() => {
    const wrappers = document.querySelectorAll(".button-border-wrapper");

    wrappers.forEach((wrapper) => {
      const purple = wrapper.querySelector(".glitch-text-purple");

      const onMouseLeave = () => {
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
      };

      wrapper.addEventListener("mouseleave", onMouseLeave);

      return () => {
        wrapper.removeEventListener("mouseleave", onMouseLeave);
      };
    });
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        await getProjects();
      } catch (error) {
        // Optionally: handle error
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    // Scroll to section if scrollTo param exists
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const scrollTo = params.get("scrollTo");
      if (scrollTo !== null) {
        let attempts = 0;
        const maxAttempts = 60; // up to 6s
        function removeParam() {
          const url = new URL(window.location);
          url.searchParams.delete("scrollTo");
          window.history.replaceState({}, document.title, url.pathname);
        }
        function checkSectionInView(section) {
          const rect = section.getBoundingClientRect();
          return (
            rect.top >= 0 &&
            rect.bottom <=
              (window.innerHeight || document.documentElement.clientHeight)
          );
        }
        // Import scrollWithRAF
        const { scrollWithRAF } = require("../utils/scrollWithRAF");
        function tryScroll() {
          if (scrollTo === "null") {
            // Scrolluj na górę strony z animacją
            scrollWithRAF(null);
            // Resetuj scrollTo param po animacji (timeout na 1s)
            setTimeout(removeParam, 1000);
            return;
          }
          const section = document.getElementById(scrollTo);
          if (section) {
            scrollWithRAF(scrollTo);
            // Czekaj aż sekcja będzie w widoku
            const interval = setInterval(() => {
              if (checkSectionInView(section)) {
                clearInterval(interval);
                removeParam();
              }
            }, 100);
            // Fallback: po 6s przestań próbować, ale NIE usuwaj parametru jeśli sekcja nie istnieje
            setTimeout(() => {
              clearInterval(interval);
              // Jeśli sekcja nie jest w widoku, nie usuwaj parametru
            }, 6000);
          } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(tryScroll, 100);
          } // NIE usuwaj parametru jeśli sekcja nie istnieje
        }
        setTimeout(tryScroll, 200); // Initial delay to allow DOM to render
      }
    }
  }, []);

  // Helper: check if mobile
  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkMobile = () => {
        setIsMobile(
          window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent)
        );
      };
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }
  }, []);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          if (currentScrollY < 10) {
            setShowNavbar(true);
          } else if (currentScrollY > lastScrollY) {
            setShowNavbar(false); // scrolling down
          } else {
            setShowNavbar(true); // scrolling up
          }
          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    setHasMounted(true);
    if (
      typeof navigator !== "undefined" &&
      /iPad|iPhone|iPod/.test(navigator.userAgent)
    ) {
      setIsIOS(true);
    }
  }, []);

  return (
    <div>
      <LogoAnimation scrollToSection={scrollToSection} />
      <Section3 speed={speed} scrollToSection={scrollToSection} />
      <Section4 scrollToSection={scrollToSection} />
      <Section5 />
    </div>
  );
}
