"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Section1 from "../components/section1";
import Section2 from "../components/section2";
import Section3 from "../components/section3";
import Section4 from "../components/section4";
import Section5 from "../components/section5";

export default function Home() {
  const [speed, setSpeed] = useState(20);

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollSpeed = Math.max(5, 50 - window.scrollY / 150);
      setSpeed(scrollSpeed);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div>
      <nav className="fixed z-50 top-0 w-screen h-16 bg-black text-white flex items-center flex-row justify-end gap-3">
        <Image
          src={"vatro_visuals_white_logo.svg"}
          alt="My SVG Icon"
          width={50}
          height={50}
          className="absolute inset-1/2 self-center"
        />
        <button onClick={() => scrollToSection("section1")}>HOME</button>
        <button onClick={() => scrollToSection("section2")}>REEL</button>
        <button onClick={() => scrollToSection("section3")}>O MNIE</button>
        <button onClick={() => scrollToSection("section4")}>PORTFOLIO</button>
        <button className="mr-16" onClick={() => scrollToSection("section5")}>
          KONTAKT
        </button>
      </nav>

      <Section1 scrollToSection={scrollToSection} />
      <Section2 scrollToSection={scrollToSection} />
      <Section3 speed={speed} scrollToSection={scrollToSection} />
      <Section4 scrollToSection={scrollToSection} />
      <Section5 />
    </div>
  );
}