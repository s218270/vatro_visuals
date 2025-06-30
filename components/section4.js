"use client";
import { useState, useEffect, useRef } from "react";
import { cardDetails } from "../config/carousel-config";
import Link from "next/link";

export default function Section4({ scrollToSection }) {
  const [activeIndex, setActiveIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState("");
  const [nextBackgroundImage, setNextBackgroundImage] = useState("");
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const items = cardDetails;
  const carouselRef = useRef(null);

  // Clone items for infinite effect
  const carouselItems = [
    items[items.length - 2], // Clone second-to-last item
    items[items.length - 1], // Clone last item
    ...items, // Original items
    items[0], // Clone first item
    items[1], // Clone second item
  ];

  // Calculate centered item index
  const getCenteredItemIndex = () => {
    const centerOffset = 2; // Show 3 items: activeIndex is first visible, +2 for center
    return (activeIndex + centerOffset) % carouselItems.length;
  };

  // Update background when active index changes
  useEffect(() => {
    if (hoveredIndex === null) {
      const centeredIndex = getCenteredItemIndex();
      const newBackgroundImage = carouselItems[centeredIndex]?.image || "";
      setNextBackgroundImage(newBackgroundImage); // Set the next background image
    }
  }, [activeIndex, hoveredIndex]);

  // Smoothly transition background images
  useEffect(() => {
    if (nextBackgroundImage && nextBackgroundImage !== backgroundImage) {
      const timer = setTimeout(() => {
        setBackgroundImage(nextBackgroundImage); // Update the visible background image
      }, 500); // Match this duration with the CSS transition duration
      return () => clearTimeout(timer);
    }
  }, [nextBackgroundImage]);

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handlePrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    setActiveIndex((prev) => {
      const newIndex = prev - 1;
      if (newIndex < 1) {
        setTimeout(() => {
          carouselRef.current.style.transition = "none";
          setActiveIndex(carouselItems.length - 4); // Adjusted for 1/6 width
          setTimeout(() => {
            carouselRef.current.style.transition = "transform 0.5s";
            setIsTransitioning(false);
          }, 50);
        }, 500);
      }
      return newIndex;
    });
  };

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    setActiveIndex((prev) => {
      const newIndex = prev + 1;
      if (newIndex > carouselItems.length - 4) {
        // Adjusted for 1/6 width
        setTimeout(() => {
          carouselRef.current.style.transition = "none";
          setActiveIndex(2);
          setTimeout(() => {
            carouselRef.current.style.transition = "transform 0.5s";
            setIsTransitioning(false);
          }, 50);
        }, 500);
      }
      return newIndex;
    });
  };

  // Handle transition end
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const handleTransitionEnd = () => setIsTransitioning(false);
    carousel.addEventListener("transitionend", handleTransitionEnd);

    return () =>
      carousel.removeEventListener("transitionend", handleTransitionEnd);
  }, []);

  return (
    <section
      id="section4"
      className="h-screen w-full flex flex-col items-center justify-center relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        transition: "background-image 0.5s ease-in-out",
      }}
    >
      {/* Additional background layer for smooth transition */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${nextBackgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity:
            nextBackgroundImage && nextBackgroundImage !== backgroundImage
              ? 1
              : 0,
          transition: "opacity 0.5s ease-in-out",
        }}
      />

      <h1 className="text-white text-4xl absolute z-20 top-2 mb-8">Projects</h1>

      {/* Carousel Container */}
      <div className="w-full max-w-6xl mx-auto absolute overflow-hidden">
        <div
          ref={carouselRef}
          className="flex transition-transform duration-500"
          style={{
            transform: `translateX(-${activeIndex * (100 / 6)}%)`,
            width: `${(carouselItems.length * 100) / 6}%`,
          }}
        >
          {carouselItems.map((item, index) => (
            <div
              key={index}
              className="w-1/3 md:w-1/3 lg:w-1/3 flex-shrink-0 p-4 flex items-end justify-center"
              style={{ height: "20rem" }}
              onMouseEnter={() => {
                setHoveredIndex(index);
                setNextBackgroundImage(item.image);
              }}
              onMouseLeave={() => {
                setHoveredIndex(null);
                setNextBackgroundImage(
                  carouselItems[getCenteredItemIndex()]?.image || ""
                );
              }}
            >
              <div
                className={`button-border-scroll glassmorphism w-full h-[14.5rem] flex items-center justify-center relative ${
                  hoveredIndex === index ? "active" : ""
                }`}
                style={{
                  borderRadius: 3,
                  minHeight: 0,
                  minWidth: 0,
                  padding: 0,
                }}
              >
                <div
                  className="button-border-content w-full h-full flex items-center justify-center overflow-hidden cursor-pointer transition-all duration-200"
                  style={{
                    backgroundImage: `url(${item.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    borderRadius: 3,
                    position: "relative",
                    zIndex: 2,
                  }}
                >
                  <span
                    className="text-white text-xl bg-black/50 px-4 py-2 rounded"
                    style={{ zIndex: 3, position: "relative" }}
                  >
                    {item.title}
                  </span>
                </div>
                <div className="border-line border-white-1"></div>
                <div className="border-line border-white-2"></div>
                <div className="border-line border-purple-1"></div>
                <div className="border-line border-purple-2"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={handlePrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/50 p-3 rounded-full hover:bg-black/70 transition-colors"
          disabled={isTransitioning}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          onClick={handleNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/50 p-3 rounded-full hover:bg-black/70 transition-colors"
          disabled={isTransitioning}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* See All Link */}
      <Link
        href="/projects"
        className="mt-8 text-white underline hover:text-gray-300 transition-colors absolute bottom-32 z-20"
      >
        See all projects
      </Link>

      {/* Section Navigation Buttons */}
      <div
        className="flex flex-col items-center gap-4 absolute z-30 bottom-10 left-1/2"
        style={{ transform: "translateX(-50%)" }}
      >
        {/* Scroll to section3 button (upwards) */}
        <div className="button-border-wrapper">
          <button
            onClick={() => scrollToSection("section3")}
            className="button-border-content bg-black p-4 rounded-full"
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
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
                style={{ transform: "rotate(180deg)" }}
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
                style={{ transform: "rotate(180deg)" }}
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
          <div className="border-line border-purple-1"></div>
          <div className="border-line border-purple-2"></div>
        </div>
        {/* Scroll to section5 button (downwards) */}
        <div className="button-border-wrapper">
          <button
            onClick={() => scrollToSection("section5")}
            className="button-border-content bg-black p-4 rounded-full"
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
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
          <div className="border-line border-purple-1"></div>
          <div className="border-line border-purple-2"></div>
        </div>
      </div>
    </section>
  );
}
