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

import { getProjects } from "../lib/getProjects";

export default function Home() {
  const [speed, setSpeed] = useState(20);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const searchParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;

  // Toggle menu function
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
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
        setTimeout(() => {
          const section = document.getElementById(scrollTo);
          if (section) {
            section.scrollIntoView({ behavior: "smooth", block: "start" });
            // Remove scrollTo param from URL after scroll
            const url = new URL(window.location);
            url.searchParams.delete("scrollTo");
            window.history.replaceState({}, document.title, url.pathname);
          }
        }, 350); // Delay to ensure DOM is ready
      }
    }
  }, []);

  return (
    <div>
      <nav
        className="fixed z-50 top-0 w-screen h-24 text-white text-lg flex items-center flex-row justify-between md:justify-evenly text-nowrap glassmorphism"
        style={{ border: "none" }}
      >
        {/* Video background */}
        {/* <button onClick={() => scrollToSection("section1")}>HOME</button> */}
        <div className="h-full px-2 hidden md:flex items-center justify-center">
          <div className="button-border-wrapper">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="button-border-content"
              style={{ position: "relative" }} // ważne żeby teksty się nakładały
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
              onClick={() => {
                const section = document.getElementById("section3");
                if (section) {
                  section.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                  let attempts = 0;
                  const maxAttempts = 16;
                  function correctScroll() {
                    const nav = document.querySelector("nav");
                    const navHeight = nav ? nav.offsetHeight : 0;
                    const rect = section.getBoundingClientRect();
                    const scrollTop =
                      window.pageYOffset || document.documentElement.scrollTop;
                    const top = rect.top + scrollTop - navHeight;
                    window.scrollTo({ top, behavior: "auto" });
                    attempts++;
                    if (
                      Math.abs(rect.top - navHeight) > 2 &&
                      attempts < maxAttempts
                    ) {
                      requestAnimationFrame(correctScroll);
                    }
                  }
                  setTimeout(() => {
                    correctScroll();
                  }, 350);
                }
              }}
              className="button-border-content"
              style={{ position: "relative" }} // ważne żeby teksty się nakładały
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
        {/* <div className="h-full w-12 hidden md:flex">
          <button
            onClick={() => scrollToSection("section3")}
            className="text-center hover:scale-125 origin-center transition-all duration-100"
          >
            O MNIE
          </button>
        </div> */}
        <video
          autoPlay
          loop
          muted
          className="w-24 h-full object-cover left-auto right-auto cursor-pointer bg-transparent"
          onClick={() => scrollToSection("section1")}
        >
          <source src="/Logo_WWW_2.webm" type="video/webm" />
        </video>
        <div className="h-full px-2 hidden md:flex items-center justify-center">
          <div className="button-border-wrapper">
            <button
              onClick={() => {
                const section = document.getElementById("section4");
                if (section) {
                  section.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                  let attempts = 0;
                  const maxAttempts = 16;
                  function correctScroll() {
                    const nav = document.querySelector("nav");
                    const navHeight = nav ? nav.offsetHeight : 0;
                    const rect = section.getBoundingClientRect();
                    const scrollTop =
                      window.pageYOffset || document.documentElement.scrollTop;
                    const top = rect.top + scrollTop - navHeight;
                    window.scrollTo({ top, behavior: "auto" });
                    attempts++;
                    if (
                      Math.abs(rect.top - navHeight) > 2 &&
                      attempts < maxAttempts
                    ) {
                      requestAnimationFrame(correctScroll);
                    }
                  }
                  setTimeout(() => {
                    correctScroll();
                  }, 350);
                }
              }}
              className="button-border-content"
              style={{ position: "relative" }} // ważne żeby teksty się nakładały
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
              onClick={() => {
                const section = document.getElementById("section5");
                if (section) {
                  section.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                  let attempts = 0;
                  const maxAttempts = 16;
                  function correctScroll() {
                    const nav = document.querySelector("nav");
                    const navHeight = nav ? nav.offsetHeight : 0;
                    const rect = section.getBoundingClientRect();
                    const scrollTop =
                      window.pageYOffset || document.documentElement.scrollTop;
                    const top = rect.top + scrollTop - navHeight;
                    window.scrollTo({ top, behavior: "auto" });
                    attempts++;
                    if (
                      Math.abs(rect.top - navHeight) > 2 &&
                      attempts < maxAttempts
                    ) {
                      requestAnimationFrame(correctScroll);
                    }
                  }
                  setTimeout(() => {
                    correctScroll();
                  }, 350);
                }
              }}
              className="button-border-content"
              style={{ position: "relative" }} // ważne żeby teksty się nakładały
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
        {/* <div className="h-full w-12 hidden md:flex">
          <button
            onClick={() => scrollToSection("section3")}
            className="text-center hover:scale-125 origin-center transition-all duration-100"
          >
            O MNIE
          </button>
        </div> */}
        {/* <div className="h-full w-12 hidden md:flex">
          <button
            onClick={() => scrollToSection("section4")}
            className="text-center hover:scale-125 origin-center transition-all duration-100"
          >
            PORTFOLIO
          </button>
        </div> */}
        {/* <div className="h-full w-12 hidden md:flex">
          <button
            onClick={() => scrollToSection("section5")}
            className="text-center hover:scale-125 origin-center transition-all duration-100"
          >
            KONTAKT
          </button>
        </div> */}

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
              {[
                { label: "HOME", section: null },
                { label: "O MNIE", section: "section3" },
                { label: "PORTFOLIO", section: "section4" },
                { label: "KONTAKT", section: "section5" },
              ].map(({ label, section }) => (
                <div className="button-border-wrapper" key={label}>
                  <button
                    onClick={() => {
                      if (label === "HOME") {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      } else if (section) {
                        const sec = document.getElementById(section);
                        if (sec) {
                          sec.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                          let attempts = 0;
                          const maxAttempts = 16;
                          function correctScroll() {
                            const nav = document.querySelector("nav");
                            const navHeight = nav ? nav.offsetHeight : 0;
                            const rect = sec.getBoundingClientRect();
                            const scrollTop =
                              window.pageYOffset ||
                              document.documentElement.scrollTop;
                            const top = rect.top + scrollTop - navHeight;
                            window.scrollTo({ top, behavior: "auto" });
                            attempts++;
                            if (
                              Math.abs(rect.top - navHeight) > 2 &&
                              attempts < maxAttempts
                            ) {
                              requestAnimationFrame(correctScroll);
                            }
                          }
                          setTimeout(() => {
                            correctScroll();
                          }, 350);
                        }
                      }
                    }}
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
              ))}
            </div>
          </div>
        )}
      </nav>
      {/* <Section1 scrollToSection={scrollToSection} /> */}
      <LogoAnimation scrollToSection={scrollToSection} />
      {/* <Section2 scrollToSection={scrollToSection} /> */}
      <Section3 speed={speed} scrollToSection={scrollToSection} />
      <Section4 scrollToSection={scrollToSection} />
      <Section5 />
    </div>
  );
}
