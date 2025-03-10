"use client";

import { useEffect } from "react";

export default function Section2({ scrollToSection }) {
  useEffect(() => {
    const video = document.getElementById("videoPlayer");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && video) {
          video.play();
        } else if (video) {
          video.pause();
        }
      },
      { threshold: 0.5 }
    );
    if (video) observer.observe(video);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="section2"
      className="h-screen w-full bg-black flex flex-col items-center justify-center relative"
    >
      <div className="w-full h-full">
        <video
          id="videoPlayer"
          className="w-full h-full shadow-lg"
          controls
          muted
          volume={0}
          onCanPlay={() => {
            const video = document.getElementById("videoPlayer");
            if (video) video.play();
          }}
        >
          <source src="Clarx & Shiah Maisel - Give Up.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      <button
        onClick={() => scrollToSection("section3")}
        className="absolute bottom-10 bg-black p-4 rounded-full hover:bg-gray-700"
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
      </button>
    </section>
  );
}