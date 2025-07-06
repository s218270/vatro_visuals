"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  // Animacje glitch na borderach
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

  // Funkcja nawigacji do sekcji przez /?scrollTo=sectionX
  const handleNav = (section) => {
    if (!section) {
      router.push("/");
    } else {
      router.push(`/?scrollTo=${section}`);
    }
    setIsMenuOpen(false);
  };

  return (
    <nav
      className="fixed z-50 top-0 w-screen h-24 text-white text-lg flex items-center flex-row justify-between md:justify-evenly text-nowrap glassmorphism"
      style={{ border: "none" }}
    >
      {/* Przyciski nawigacji desktop */}
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
      {/* ANIMOWANE WEBM W CENTRUM */}
      <video
        autoPlay
        loop
        muted
        className="w-24 h-full object-cover left-auto right-auto cursor-pointer bg-transparent"
        onClick={() => handleNav("section1")}
      >
        <source src="/Logo_WWW_2.webm" type="video/webm" />
      </video>
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
          onClick={() => setIsMenuOpen((v) => !v)}
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
                  onClick={() => handleNav(section)}
                  className="button-border-content"
                  style={{ position: "relative" }}
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
  );
}
