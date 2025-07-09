"use client";
import { useState, useEffect } from "react";
import { getProjects } from "@/lib/getProjects";
import Image from "next/image";
import Link from "next/link";
import "../fadein.css";

export default function ProjectPage({ params }) {
  const { projectId } = params;
  const [project, setProject] = useState(null);
  const [loaded, setLoaded] = useState({ main: false, files: [] });

  useEffect(() => {
    async function fetchData() {
      const projects = await getProjects();
      const found = projects.find((p) => p.id === projectId);
      setProject(found);
      setLoaded({
        main: false,
        files:
          found && found.files ? Array(found.files.length).fill(false) : [],
      });
    }
    fetchData();
  }, [projectId]);

  function isIOS() {
    if (typeof window === "undefined") return false;
    return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.userAgent.includes("Mac") && "ontouchend" in document)
    );
  }

  function handleMainImageLoad() {
    setLoaded((prev) => ({ ...prev, main: true }));
  }
  function handleFileImageLoad(idx) {
    setLoaded((prev) => ({
      ...prev,
      files: prev.files.map((v, i) => (i === idx ? true : v)),
    }));
  }

  // Convert Firestore timestamp to readable date
  let dateString = "";
  if (project && project.date && project.date.seconds) {
    dateString = new Date(project.date.seconds * 1000).toLocaleDateString();
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Projekt nie znaleziony</h1>
        <Link href="/projects" className="text-purple-400 underline">
          Powrót do projektów
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-0 pt-0 w-full">
      <div className="w-full flex items-start mt-4" style={{ height: 56 }}>
        <div className="fixed top-28 left-4 z-40">
          <div className="button-border-wrapper">
            <Link
              href="/projects"
              className="button-border-content bg-black p-4 rounded-full"
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                className="glitch-text-white"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
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
              </span>
              <span
                className="glitch-text-purple"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-6 h-6 text-[#a259f7]"
                  style={{ transform: "rotate(90deg)" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </span>
            </Link>
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
      </div>
      {project.mainImage && (
        <div
          className="relative w-full flex items-center justify-center mb-6"
          style={{ minHeight: "50vh", height: "50vh", maxHeight: "80vh" }}
        >
          {!loaded.main && (
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
          <Image
            src={project.mainImage}
            alt={project.title}
            fill={true}
            className="object-cover rounded-none"
            sizes="100vw"
            priority
            onLoad={handleMainImageLoad}
            onError={handleMainImageLoad}
            style={{ borderRadius: 0 }}
          />
          {/* Gradient mask overlay for dimming effect */}
          <div
            className="absolute left-0 top-0 w-full h-full pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.85) 100%)",
              borderRadius: 0,
            }}
          />
        </div>
      )}
      <h1
        className="text-4xl font-bold mb-2 text-center animate-fade-in"
        style={{ animationDelay: "80ms", animationFillMode: "both" }}
      >
        {project.title}
      </h1>
      <div
        className="mb-6 text-lg text-center text-gray-300 animate-fade-in"
        style={{ animationDelay: "120ms", animationFillMode: "both" }}
      >
        {project.shortDescription || "-"}
      </div>
      <div
        className="max-w-2xl mx-auto mb-8 p-6 rounded-[3px] glassmorphism shadow-lg animate-fade-in"
        style={{ animationDelay: "200ms", animationFillMode: "both" }}
      >
        <div className="mb-2 text-sm text-gray-400 font-semibold">
          Data: {dateString || "-"}
        </div>
        <div className="mb-4 text-sm text-gray-400 font-semibold">
          Klient: {project.client || "-"}
        </div>
        <div className="whitespace-pre-line text-base text-white">
          {project.fullDescription || project.fullDesctiption || "-"}
        </div>
      </div>
      {project.files && project.files.length > 0 && (
        <div
          className="mb-6 animate-fade-in md:max-w-[60vw] max-w-[90vw] justify-center mx-auto rounded-[3px]"
          style={{
            animationDelay: "500ms",
            animationFillMode: "both",
          }}
        >
          <div className="w-full items-center justify-center flex py-4">
            <span className="font-semibold">Pliki:</span>
          </div>
          <ul className="flex flex-col gap-8 mt-4">
            {project.files.map((file, idx) => {
              let imgUrl = null;
              if (typeof file.path === "string") {
                imgUrl = file.path;
              } else if (file.path && file.path.referencePath) {
                if (file.path.referencePath.startsWith("http")) {
                  imgUrl = file.path.referencePath;
                } else {
                  const fileName = file.path.referencePath.split("/").pop();
                  imgUrl = `https://firebasestorage.googleapis.com/v0/b/vatrovisuals-5eb95.firebasestorage.app/o/${encodeURIComponent(
                    fileName
                  )}?alt=media`;
                }
              }
              // Determine file type
              let ext = "";
              if (imgUrl) {
                const match = imgUrl.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
                ext = match ? match[1].toLowerCase() : "";
              }
              const isImage = [
                "jpg",
                "jpeg",
                "png",
                "webp",
                "gif",
                "svg",
              ].includes(ext);
              const isVideo = ["mp4", "mov", "webm"].includes(ext);
              const isVector = ["ai", "eps"].includes(ext);
              return (
                <li
                  key={idx}
                  className="glassmorphism p-4 rounded-[3px] shadow-lg animate-fade-in"
                  style={{
                    animationDelay: `${600 + idx * 100}ms`,
                    animationFillMode: "both",
                  }}
                >
                  <div className="mb-4 text-center text-base text-white font-semibold">
                    {file.description || "No description"}
                  </div>
                  {imgUrl && (
                    <div className="mt-4 w-full rounded-[3px] relative flex flex-col items-center">
                      {!loaded.files[idx] && (
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
                      {isImage && (
                        <Image
                          src={imgUrl}
                          alt={file.description || `File ${idx + 1}`}
                          width={400}
                          height={250}
                          className="rounded border border-gray-700 object-contain bg-black"
                          onLoad={() => handleFileImageLoad(idx)}
                          onError={() => handleFileImageLoad(idx)}
                          style={{ borderRadius: "inherit" }}
                        />
                      )}
                      {isVideo && (
                        <video
                          src={imgUrl}
                          controls
                          className="rounded border border-gray-700 bg-black w-full max-h-64 object-contain"
                          style={{ borderRadius: "inherit" }}
                          onLoadedData={() => handleFileImageLoad(idx)}
                          onError={() => handleFileImageLoad(idx)}
                        />
                      )}
                      {isVector && (
                        <a
                          href={imgUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-400 underline mt-2"
                          onLoad={() => handleFileImageLoad(idx)}
                        >
                          Pobierz plik {ext.toUpperCase()}
                        </a>
                      )}
                      {!isImage && !isVideo && !isVector && (
                        <a
                          href={imgUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-400 underline mt-2"
                          onLoad={() => handleFileImageLoad(idx)}
                        >
                          Zobacz plik
                        </a>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
