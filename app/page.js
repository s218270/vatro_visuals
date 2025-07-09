"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Section1 from "../components/section1";
import Section2 from "../components/section2";
import Section3 from "../components/section3";
import Section4 from "../components/section4";
import Section5 from "../components/section5";
import LogoAnimation from "@/components/LogoAnimation";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "../components/Navbar";

import { getProjects } from "../lib/getProjects";

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

  // Toggle menu function
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const scrollToSection = (id) => {
    console.log("scrollToSection called with id:", id);
    if (!id) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setIsMenuOpen(false);
      return;
    }
    const section = document.getElementById(id);
    if (!section) {
      console.warn("Section not found in DOM:", id);
    } else {
      console.log("Section found:", section, section.getBoundingClientRect());
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
        const data = await getProjects();
        console.log("Projects:", data);
      } catch (error) {
        console.error("Błąd przy pobieraniu projektów:", error);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    // Scroll to section if scrollTo param exists
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const scrollTo = params.get("scrollTo");
      if (scrollTo) {
        let attempts = 0;
        const maxAttempts = 40; // up to 4s
        let scrollEndTimeout;
        function removeParam() {
          const url = new URL(window.location);
          url.searchParams.delete("scrollTo");
          window.history.replaceState({}, document.title, url.pathname);
        }
        function onScrollEnd() {
          window.removeEventListener("scroll", onScrollEndHandler);
          removeParam();
        }
        function onScrollEndHandler() {
          clearTimeout(scrollEndTimeout);
          scrollEndTimeout = setTimeout(onScrollEnd, 150);
        }
        function tryScroll() {
          const section = document.getElementById(scrollTo);
          if (section) {
            section.scrollIntoView({ behavior: "smooth", block: "start" });
            // Listen for scroll end
            window.addEventListener("scroll", onScrollEndHandler);
            // Fallback: remove param after 4s if scroll event never fires
            setTimeout(() => {
              window.removeEventListener("scroll", onScrollEndHandler);
              removeParam();
            }, 4000);
          } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(tryScroll, 100);
          } else {
            removeParam();
          }
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
      <Navbar scrollToSection={scrollToSection} />
      {/* <Section1 scrollToSection={scrollToSection} /> */}
      {/* Przywrócono LogoAnimation */}
      <LogoAnimation scrollToSection={scrollToSection} />
      {/* <Section2 scrollToSection={scrollToSection} /> */}
      <Section3 speed={speed} scrollToSection={scrollToSection} />
      <Section4 scrollToSection={scrollToSection} />
      <Section5 />
    </div>
  );
}
