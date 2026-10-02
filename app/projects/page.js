"use client";
import { useState, useEffect, useRef } from "react";
import { getProjects } from "@/lib/getProjects";
import Image from "next/image";
import Link from "next/link";
import "./fadein.css";
import GlitchButton from "@/components/GlitchButton";
import PreventDownloadWrapper from "@/components/PreventDownloadWrapper";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loaded, setLoaded] = useState([]);

  useEffect(() => {
    async function fetchData() {
      // limit to 100 items to avoid fetching huge payloads at once
      const data = await getProjects({ limit: 100 });
      const sorted = sortProjectsByPriority(data);
      setProjects(sorted);
      setLoaded(Array(sorted.length).fill(false));
    }
    fetchData();
  }, []);

  // Helper to resolve thumbnail/mainImage storage refs to usable URLs
  function resolveImageRef(img) {
    if (!img) return null;
    if (typeof img === "string") return img;
    if (img.referencePath) {
      if (img.referencePath.startsWith("http")) return img.referencePath;
      const fileName = img.referencePath.split("/").pop();
      const bucketHost = "vatrovisuals-5eb95.appspot.com";
      return `https://firebasestorage.googleapis.com/v0/b/${bucketHost}/o/${encodeURIComponent(
        fileName,
      )}?alt=media${img.token ? `&token=${img.token}` : ""}`;
    }
    return null;
  }

  // Sort helper: projects with numeric `priority` first (ascending), then others
  function sortProjectsByPriority(list) {
    if (!Array.isArray(list)) return list;
    const withPriority = [];
    const withoutPriority = [];
    for (const item of list) {
      if (typeof item.priority === "number") withPriority.push(item);
      else withoutPriority.push(item);
    }
    withPriority.sort((a, b) => a.priority - b.priority);
    return [...withPriority, ...withoutPriority];
  }

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
    <div className="min-h-screen bg-[#080808] text-[#f2f2f2] p-8 pt-32">
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
                onClick={(e) => {
                  if (
                    e.button === 0 &&
                    !e.metaKey &&
                    !e.ctrlKey &&
                    !e.shiftKey &&
                    !e.altKey
                  ) {
                    e.preventDefault();
                    window.location.href = "/";
                  }
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-6 h-6 text-[#f2f2f2]"
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
                onClick={(e) => {
                  if (
                    e.button === 0 &&
                    !e.metaKey &&
                    !e.ctrlKey &&
                    !e.shiftKey &&
                    !e.altKey
                  ) {
                    e.preventDefault();
                    window.location.href = `/projects/${project.id}`;
                  }
                }}
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
                      <div className="flex items-center justify-center w-full h-full z-20 absolute left-0 top-0 right-0 bottom-0 bg-[#080808]/60">
                        {typeof window !== "undefined" && isIOS() ? (
                          <div
                            style={{
                              width: 96,
                              height: 96,
                              border: "6px solid #6a00d1",
                              borderTop: "6px solid #f2f2f2",
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
                              width: 96,
                              height: 96,
                              objectFit: "contain",
                              background: "none",
                            }}
                          />
                        )}
                        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                      </div>
                    )}
                    {(() => {
                      const thumbSrc = resolveImageRef(
                        project.thumbnail || project.mainImage,
                      );
                      return thumbSrc ? (
                        <PreventDownloadWrapper className="w-full h-full">
                          <Image
                            src={thumbSrc}
                            alt={project.title}
                            fill
                            loading="lazy"
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 33vw"
                            onLoad={() => handleImageLoad(idx)}
                            onError={() => handleImageLoad(idx)}
                            style={{ borderRadius: "inherit" }}
                          />
                        </PreventDownloadWrapper>
                      ) : null;
                    })()}
                  </div>
                  <div className="p-4 bg-[#080808]/60 backdrop-blur-sm rounded-b-[3px] w-full">
                    <h2 className="text-xl mb-2 text-[#f2f2f2]">
                      {project.title}
                    </h2>
                    <p className="text-gray-300 font-lexend font-light">
                      {project.shortDescription}
                    </p>
                  </div>
                </div>
              </Link>
            </GlitchButton>
          </div>
        ))}
      </div>
    </div>
  );
}
