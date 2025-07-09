"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import PropTypes from "prop-types";

export default function Navbar({ scrollToSection }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isIOS, setIsIOS] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const router = useRouter();
  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "/";

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

  const handleNav = (section) => {
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
          { once: true }
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
          window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent)
        );
      };
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }
  }, []);

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

  return (
    <nav
      className={`fixed z-50 top-0 w-screen h-24 text-white text-lg flex items-center flex-row justify-between md:justify-evenly text-nowrap glassmorphism transition-transform duration-300${
        showNavbar ? " translate-y-0" : " -translate-y-full"
      }`}
      style={{ border: "none" }}
    >
      <div className="h-full px-2 hidden md:flex items-center justify-center">
        <div className="button-border-wrapper">
          <button
            onClick={() => handleNav(null)}
            className="button-border-content"
            style={{ position: "relative" }}
          >
            <span className="glitch-text-white">HOME</span>
            <span className="glitch-text-purple">HOME</span>
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
      </div>
      <div className="h-full px-2 hidden md:flex items-center justify-center">
        <div className="button-border-wrapper">
          <button
            onClick={() => handleNav("section3")}
            className="button-border-content"
            style={{ position: "relative" }}
          >
            <span className="glitch-text-white">O MNIE</span>
            <span className="glitch-text-purple">O MNIE</span>
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
      </div>
      {/* Video background z fallbackiem na iOS */}
      {hasMounted ? (
        isIOS ? (
          <img
            src="/Logo%20Merged.svg"
            alt="Logo"
            className="w-24 h-full object-cover left-auto right-auto ml-4 cursor-pointer bg-transparent"
            style={{ display: "block" }}
            onClick={() => handleNav("section1")}
          />
        ) : (
          <video
            autoPlay
            loop
            muted
            className="w-24 h-full object-cover ml-4 md:ml-0 left-auto right-auto cursor-pointer bg-transparent"
            onClick={() => handleNav("section1")}
          >
            <source src="/Logo_WWW_2.webm" type="video/webm" />
            <img
              src="/Logo%20Merged.svg"
              alt="Logo"
              className="w-24 h-full object-cover ml-4 left-auto right-auto cursor-pointer bg-transparent"
              style={{ display: "block" }}
            />
          </video>
        )
      ) : (
        <div style={{ width: "6rem", height: "100%" }} />
      )}
      <div className="h-full px-2 hidden md:flex items-center justify-center">
        <div className="button-border-wrapper">
          <button
            onClick={() => handleNav("section4")}
            className="button-border-content"
            style={{ position: "relative" }}
          >
            <span className="glitch-text-white">PORTFOLIO</span>
            <span className="glitch-text-purple">PORTFOLIO</span>
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
      </div>
      <div className="h-full px-2 hidden md:flex items-center justify-center">
        <div className="button-border-wrapper">
          <button
            onClick={() => handleNav("section5")}
            className="button-border-content"
            style={{ position: "relative" }}
          >
            <span className="glitch-text-white">KONTAKT</span>
            <span className="glitch-text-purple">KONTAKT</span>
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
      </div>
      {/* Hamburger Menu (mobile only) */}
      <div className="md:hidden mr-6">
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
      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div
          className="mobile-sidebar glassmorphism fixed right-0 w-1/2 h-screen md:hidden z-50 open"
          style={{
            border: "none",
            top: "6rem", // ustawione na wysokość navbaru (h-24 = 6rem = 96px)
            borderRadius: 0,
          }}
        >
          <div className="flex flex-col pt-8 gap-8 h-full items-start pl-8">
            {/*
              { label: "HOME", section: null },
              { label: "O MNIE", section: "section3" },
              { label: "PORTFOLIO", section: "section4" },
              { label: "KONTAKT", section: "section5" },
            */}
            {["HOME", "O MNIE", "PORTFOLIO", "KONTAKT"].map((label, idx) => {
              const section = idx === 0 ? null : `section${idx + 2}`;
              return (
                <div className="button-border-wrapper" key={label}>
                  <button
                    onClick={() => handleNav(section)}
                    className="button-border-content"
                    style={{ position: "relative" }}
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
                    <span className="glitch-text-white">{label}</span>
                    <span className="glitch-text-purple">{label}</span>
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
