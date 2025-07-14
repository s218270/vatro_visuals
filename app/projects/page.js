"use client";
import { useState, useEffect, useRef } from "react";
import { getProjects } from "@/lib/getProjects";
import Image from "next/image";
import Link from "next/link";
import "./fadein.css";
import GlitchButton from "@/components/GlitchButton";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [loaded, setLoaded] = useState([]);
  const borderRefs = useRef([]);

  useEffect(() => {
    async function fetchData() {
      const data = await getProjects();
      setProjects(data);
      setLoaded(Array(data.length).fill(false));
    }
    fetchData();
  }, []);

  //   function resetBorderAnimation(ref) {
  //     if (!ref?.current) return;
  //     ref.current.classList.remove("animate-in");
  //     void ref.current.offsetWidth;
  //     requestAnimationFrame(() => {
  //       ref.current.classList.add("animate-in");
  //     });
  //   }

  //   function handleCardMouseEnter(idx) {
  //     setHoveredIndex(idx);
  //     if (borderRefs.current[idx]) {
  //       resetBorderAnimation({ current: borderRefs.current[idx] });
  //     }
  //   }
  //   function handleCardMouseLeave() {
  //     setHoveredIndex(null);
  //   }

  function isIOS() {
    if (typeof window === "undefined") return false;
    return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.userAgent.includes("Mac") && "ontouchend" in document)
    );
  }

  function handleImageLoad(idx) {
    setLoaded((prev) => {
      const arr = [...prev];
      arr[idx] = true;
      return arr;
    });
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 pt-32">
      {/* Przycisk cofania pod navbarem */}
      <div className="w-full flex items-start mt-4" style={{ height: 56 }}>
        <div className="fixed top-28 left-4 z-40">
          <GlitchButton
            styles={{ padding: "0" }}
            text={
              <Link
                href="/"
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "16px 24px",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-6 h-6 text-white"
                  style={{ transform: "rotate(90deg)" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </Link>
            }
          />
        </div>
      </div>
      <h1 className="text-4xl mb-8 text-center">Projekty</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {projects.map((project, idx) => (
          <div key={project.id} className="group">
            <GlitchButton
              styles={{
                width: "100%",
                height: "100%",
                position: "relative",
                paddingX: "0 !important",
              }}
            >
              <Link
                href={`/projects/${project.id}`}
                className="block h-full w-full"
                style={{ height: "100%" }}
              >
                <div
                  className={`glassmorphism w-full h-64 flex flex-col justify-end relative transition-all duration-200 group-hover:scale-105 origin-bottom animate-fade-in`}
                  style={{
                    borderRadius: 3,
                    minHeight: 0,
                    minWidth: 0,
                    padding: 0,
                    animationDelay: `${idx * 80}ms`,
                    animationFillMode: "both",
                  }}
                >
                  <div className="relative w-full h-2/3">
                    {!loaded[idx] && (
                      <div className="flex items-center justify-center w-full h-full z-20 absolute left-0 top-0 right-0 bottom-0 bg-black/60">
                        {typeof window !== "undefined" && isIOS() ? (
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              border: "6px solid #6a00d1",
                              borderTop: "6px solid #fff",
                              borderRadius: "50%",
                              animation: "spin 1.2s linear infinite",
                            }}
                          />
                        ) : (
                          <video
                            src="/Loading_WWW.webm"
                            autoPlay
                            loop
                            muted
                            style={{
                              width: 48,
                              height: 48,
                              objectFit: "contain",
                              background: "none",
                            }}
                          />
                        )}
                        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                      </div>
                    )}
                    {project.mainImage && (
                      <Image
                        src={project.mainImage}
                        alt={project.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        onLoad={() => handleImageLoad(idx)}
                        onError={() => handleImageLoad(idx)}
                        style={{ borderRadius: "inherit" }}
                      />
                    )}
                  </div>
                  <div className="p-4 bg-black/60 backdrop-blur-sm rounded-b-[3px] w-full">
                    <h2 className="text-xl mb-2 text-white">{project.title}</h2>
                    <p className="text-gray-300">{project.shortDescription}</p>
                  </div>
                </div>
              </Link>
            </GlitchButton>
            {/* <Link
              href={`/projects/${project.id}`}
              className="block h-full"
              style={{ height: "100%" }}
              onMouseEnter={() => handleCardMouseEnter(idx)}
              onMouseLeave={handleCardMouseLeave}
            >
              <div
                ref={(el) => (borderRefs.current[idx] = el)}
                className={`button-border-scroll glassmorphism w-full h-64 flex flex-col justify-end relative transition-all duration-200 group-hover:scale-105 origin-bottom animate-in${
                  hoveredIndex === idx ? " active" : ""
                } animate-fade-in`}
                style={{
                  borderRadius: 3,
                  minHeight: 0,
                  minWidth: 0,
                  padding: 0,
                  animationDelay: `${idx * 80}ms`,
                  animationFillMode: "both",
                }}
              >
                <div className="relative w-full h-2/3">
                  {!loaded[idx] && (
                    <div className="flex items-center justify-center w-full h-full z-20 absolute left-0 top-0 right-0 bottom-0 bg-black/60">
                      {typeof window !== "undefined" && isIOS() ? (
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            border: "6px solid #a259f7",
                            borderTop: "6px solid #fff",
                            borderRadius: "50%",
                            animation: "spin 1.2s linear infinite",
                          }}
                        />
                      ) : (
                        <video
                          src="/Loading_WWW.webm"
                          autoPlay
                          loop
                          muted
                          style={{
                            width: 48,
                            height: 48,
                            objectFit: "contain",
                            animation: "spin 1.2s linear infinite",
                            background: "none",
                          }}
                        />
                      )}
                      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                    </div>
                  )}
                  {project.mainImage && (
                    <Image
                      src={project.mainImage}
                      alt={project.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      onLoad={() => handleImageLoad(idx)}
                      onError={() => handleImageLoad(idx)}
                      style={{ borderRadius: "inherit" }}
                    />
                  )}
                </div>
                <div className="p-4 bg-black/60 backdrop-blur-sm rounded-b-[3px] w-full">
                  <h2 className="text-xl font-bold mb-2 text-white">
                    {project.title}
                  </h2>
                  <p className="text-gray-300">{project.shortDescription}</p>
                </div>
                <div className="border-line border-white-1"></div>
                <div className="border-line border-white-2"></div>
                <div className="border-white-glow-top"></div>
                <div className="border-white-glow-right"></div>
                <div className="border-white-glow-bottom"></div>
                <div className="border-white-glow-left"></div>
                <div className="border-line border-purple-1"></div>
                <div className="border-line border-purple-2"></div>
                <div className="border-purple-glow-top"></div>
                <div className="border-purple-glow-right"></div>
                <div className="border-purple-glow-bottom"></div>
                <div className="border-purple-glow-left"></div>
              </div>
            </Link> */}
          </div>
        ))}
      </div>
    </div>
  );
}
