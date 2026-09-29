"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import PropTypes from "prop-types";
import GlitchButton from "./GlitchButton";
import { scrollWithRAF } from "../utils/scrollWithRAF";

export default function Navbar({ scrollToSection }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isIOS, setIsIOS] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef(null);
  const router = useRouter();
  let pathname = typeof window !== "undefined" ? window.location.pathname : "/";

  // Toggle menu function
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const scrollToSectionHandler = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  const handleNav = (id) => {
    pathname = typeof window !== "undefined" ? window.location.pathname : "/";
    // (log usunięty)
    if (pathname !== "/") {
      router.push(`/?scrollTo=${id}`);
      setIsMenuOpen(false);
      return;
    } else {
      scrollWithRAF(id);
      setIsMenuOpen(false);
    }
    // Scrollowanie na stronie głównej (z animacją)
    // if (!id) {
    //   window.scrollTo({ top: 0, behavior: "smooth" });
    //   setIsMenuOpen(false);
    //   return;
    // }
    // Użyj scrollWithRAF zamiast scrollIntoView/intersectionObserver
  };

  const handleNav2 = (section) => {
    if (pathname !== "/") {
      if (!section) {
        router.push("/");
      } else {
        router.push(`/?scrollTo=${section}`);
      }
      setIsMenuOpen(false);
      return;
    }
    // If on home and scrollToSection prop is provided, use it
    if (typeof scrollToSection === "function") {
      scrollToSection(section);
      setIsMenuOpen(false);
      return;
    }
    // Fallback: internal scroll logic
    if (!section) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setIsMenuOpen(false);
      return;
    }
    const sec = document.getElementById(section);
    if (sec) {
      sec.scrollIntoView({ behavior: "smooth", block: "start" });
      setIsMenuOpen(false);
      return;
    }
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleScrollResize = () => {
      // Only used for speed in main page, not needed here
    };
    window.addEventListener("scroll", handleScrollResize);
    window.addEventListener("resize", handleScrollResize);
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
          { once: true },
        );
      };
      wrapper.addEventListener("mouseleave", onMouseLeave);
      return () => {
        wrapper.removeEventListener("mouseleave", onMouseLeave);
      };
    });
  }, []);

  // Helper: check if mobile
  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkMobile = () => {
        setIsMobile(
          window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent),
        );
      };
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }
  }, []);

  // ...existing code...

  useEffect(() => {
    setHasMounted(true);
    if (
      typeof navigator !== "undefined" &&
      /iPad|iPhone|iPod/.test(navigator.userAgent)
    ) {
      setIsIOS(true);
    }
  }, []);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!isMobile) {
        setShowNavbar(true);
        return;
      }
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
  }, [lastScrollY, isMobile]);

  // Ensure videoLoaded is set if video is already loaded (e.g. from cache)
  useEffect(() => {
    if (!videoLoaded && videoRef.current && videoRef.current.readyState >= 3) {
      setVideoLoaded(true);
    }
  }, [videoLoaded]);

  return (
    <nav
      className={`fixed z-50 top-0 w-full h-[80px] text-[#f2f2f2] text-lg flex items-center flex-row text-nowrap glassmorphism transition-transform duration-300${
        showNavbar ? " translate-y-0" : " -translate-y-full"
      }`}
      style={{ border: "none" }}
    >
      {/* Centered inner container to match page content (max-w) so logo aligns with section centers */}
      <div className="w-full max-w-6xl mx-auto relative flex items-center justify-between px-4 md:px-0 grid-at-940">
        {/* Left buttons (desktop) - hidden on mobile, shown at >=940px */}
        <div className="hidden nav-left-group min-w-0 items-center gap-6">
          <div className="h-full px-2 flex items-center justify-center">
            <GlitchButton onClick={() => handleNav(null)} text={"HOME"} />
          </div>
          <div className="h-full px-2 flex items-center justify-center">
            <GlitchButton
              onClick={() => handleNav("section3")}
              text={"O MNIE"}
            />
          </div>
        </div>

        {/* Center spacer sits in middle grid column and will align exactly with the absolutely-positioned logo */}
        <div
          className="center-spacer hidden w-24 h-20 pointer-events-none"
          aria-hidden="true"
        />

        {/* Right buttons (desktop) */}
        <div className="hidden nav-right-group min-w-0 items-center gap-6">
          <div className="h-full px-2 flex items-center justify-center">
            <GlitchButton
              onClick={() => handleNav("section4")}
              text={"PORTFOLIO"}
            />
          </div>
          <div className="h-full px-2 flex items-center justify-center">
            <GlitchButton
              onClick={() => handleNav("section5")}
              text={"KONTAKT"}
            />
          </div>
        </div>
        {/* Video background z fallbackiem na iOS */}
        {/* Center logo — absolutely centered on large screens via .grid-at-940 media rules */}
        {isIOS ? (
          <span
            className="logo-wrapper relative w-24 h-20 ml-4 cursor-pointer bg-transparent"
            onClick={() => handleNav(null)}
            role="img"
            aria-label="Logo"
            tabIndex={0}
          >
            {/* Inline SVG */}
            <svg
              version="1.1"
              id="Logo_Merged"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              x="0px"
              y="0px"
              viewBox="0 0 2000 2000"
              style={{
                enableBackground: "new 0 0 2000 2000",
                width: "100%",
                height: "100%",
              }}
              xmlSpace="preserve"
            >
              <style type="text/css">{`.st0{fill:#F2F2F2;}`}</style>
              <path
                className="st0"
                d="M1237.5,1512.32l95-54.85v-109.7l-95,54.85V1512.32z M1427.5,1402.62l483.61-279.21L1047.5,624.8v997.22 l95-54.85V789.35l578.61,334.06l-293.61,169.52V1402.62z M857.5,1457.47l-578.61-334.06l110.02-63.52v-109.7L88.89,1123.41 l863.61,498.61V624.8l-95,54.85V1457.47z M1721.11,794.32L1000,377.98L278.89,794.32v109.7L952.5,515.11l47.5-27.43l47.5,27.43 l673.61,388.91V794.32z"
              />
            </svg>
          </span>
        ) : (
          <div className="logo-wrapper relative w-24 h-20 ml-4 cursor-pointer bg-transparent">
            {/* Always render video, but hide it until loaded. Show SVG only if not loaded. */}
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              className="w-24 h-full object-cover ml-4 md:ml-0 left-auto right-auto cursor-pointer bg-transparent"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                zIndex: 2,
                display: videoLoaded ? "block" : "none",
              }}
              onClick={() => handleNav(null)}
              onLoadedData={() => setVideoLoaded(true)}
              onError={() => setVideoLoaded(true)}
            >
              <source src="/Logo_WWW_2.webm" type="video/webm" />
              {/* Inline SVG fallback for video (for browsers that don't support webm) */}
              <svg
                version="1.1"
                id="Logo_Merged"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                x="0px"
                y="0px"
                viewBox="0 0 2000 2000"
                style={{
                  enableBackground: "new 0 0 2000 2000",
                  width: "100%",
                  height: "100%",
                }}
                xmlSpace="preserve"
              >
                <style type="text/css">{`.st0{fill:#F2F2F2;}`}</style>
                <path
                  className="st0"
                  d="M1237.5,1512.32l95-54.85v-109.7l-95,54.85V1512.32z M1427.5,1402.62l483.61-279.21L1047.5,624.8v997.22 l95-54.85V789.35l578.61,334.06l-293.61,169.52V1402.62z M857.5,1457.47l-578.61-334.06l110.02-63.52v-109.7L88.89,1123.41 l863.61,498.61V624.8l-95,54.85V1457.47z M1721.11,794.32L1000,377.98L278.89,794.32v109.7L952.5,515.11l47.5-27.43l47.5,27.43 l673.61,388.91V794.32z"
                />
              </svg>
            </video>
            {!videoLoaded && (
              <span
                className="w-24 h-full left-auto right-auto cursor-pointer bg-transparent"
                style={{
                  display: "block",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  zIndex: 1,
                  width: "100%",
                  height: "100%",
                }}
                onClick={() => handleNav(null)}
                role="img"
                aria-label="Logo"
                tabIndex={0}
              >
                <svg
                  version="1.1"
                  id="Logo_Merged"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  x="0px"
                  y="0px"
                  viewBox="0 0 2000 2000"
                  style={{
                    enableBackground: "new 0 0 2000 2000",
                    width: "100%",
                    height: "100%",
                  }}
                  xmlSpace="preserve"
                >
                  <style type="text/css">{`.st0{fill:#F2F2F2;}`}</style>
                  <path
                    className="st0"
                    d="M1237.5,1512.32l95-54.85v-109.7l-95,54.85V1512.32z M1427.5,1402.62l483.61-279.21L1047.5,624.8v997.22 l95-54.85V789.35l578.61,334.06l-293.61,169.52V1402.62z M857.5,1457.47l-578.61-334.06l110.02-63.52v-109.7L88.89,1123.41 l863.61,498.61V624.8l-95,54.85V1457.47z M1721.11,794.32L1000,377.98L278.89,794.32v109.7L952.5,515.11l47.5-27.43l47.5,27.43 l673.61,388.91V794.32z"
                  />
                </svg>
              </span>
            )}
          </div>
        )}
        {/* (right group removed — combined into the single desktop group above) */}
        {/* Hamburger Menu (mobile only, hidden at >=940px) */}
        <div className="hamburger-toggle mr-6">
          <button
            onClick={toggleMenu}
            className="focus:outline-none"
            aria-label="Toggle menu"
            style={{
              background: "none",
              border: "none",
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              className={`hamburger${isMenuOpen ? " open" : ""}`}
              style={{ display: "inline-block" }}
            >
              <span className="hamburger-bar top"></span>
              <span className="hamburger-bar middle"></span>
              <span className="hamburger-bar bottom"></span>
            </span>
          </button>
        </div>
      </div>
      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div
          className="mobile-sidebar glassmorphism fixed right-0 h-screen mobile-only z-50 open"
          style={{
            border: "none",
            top: "80px", // ustawione na wysokość navbaru (h-24 = 6rem = 96px)
            borderRadius: 0,
            width: "80vw", // zwiększona szerokość sidebaru na mobile
            maxWidth: "400px", // opcjonalnie ograniczenie szerokości
          }}
        >
          <div className="flex flex-col pt-8 gap-8 h-full items-center w-full pl-0">
            {/*
              { label: "HOME", section: null },
              { label: "O MNIE", section: "section3" },
              { label: "PORTFOLIO", section: "section4" },
              { label: "KONTAKT", section: "section5" },
            */}
            {["HOME", "O MNIE", "PORTFOLIO", "KONTAKT"].map((label, idx) => {
              const section = idx === 0 ? null : `section${idx + 2}`;
              return (
                <GlitchButton
                  key={label}
                  onClick={() => handleNav(section)}
                  text={label}
                />
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}

Navbar.propTypes = {
  scrollToSection: PropTypes.func,
};
