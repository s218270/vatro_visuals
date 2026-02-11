"use client";
import { useState, useEffect } from "react";
import { getProjectById } from "@/lib/getProjectById";
import Link from "next/link";
import "../fadein.css";
import GlitchButton from "@/components/GlitchButton";
import PreventDownloadWrapper from "@/components/PreventDownloadWrapper";
import { useRef } from "react";

export function useElementInView(offset = 120) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const [measured, setMeasured] = useState(false);
  useEffect(() => {
    let raf = null;
    function measureNow() {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const isVisible =
          rect.top < window.innerHeight - offset && rect.bottom > offset;
        setInView(isVisible);
        setMeasured(true);
      } else {
        // try again next frame until the ref is attached
        raf = requestAnimationFrame(measureNow);
      }
    }

    function onScroll() {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const isVisible =
        rect.top < window.innerHeight - offset && rect.bottom > offset;
      setInView(isVisible);
      setMeasured(true);
    }

    // initial measurement on next frame to ensure ref is mounted
    raf = requestAnimationFrame(measureNow);
    window.addEventListener("scroll", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [offset]);
  return [ref, inView, measured];
}

// Top-level AnimatedFrame component to avoid remounts when ProjectPage re-renders
export function AnimatedFrame({ children, className = "", style = {} }) {
  const [ref, inView, measured] = useElementInView(120);
  const [whiteActiveLocal, setWhiteActiveLocal] = useState(false);
  const [purpleActiveLocal, setPurpleActiveLocal] = useState(false);
  const [hideWhiteLocal, setHideWhiteLocal] = useState(false);
  const [isResettingLocal, setIsResettingLocal] = useState(false);
  const [isHardResetLocal, setIsHardResetLocal] = useState(false);
  const purpleTimeoutLocal = useRef();
  const resetTimeoutLocal = useRef();
  const hardResetTimeoutLocal = useRef();

  const visibleLocal = measured ? inView : true;

  useEffect(() => {
    if (visibleLocal) {
      setIsResettingLocal(false);
      setIsHardResetLocal(false);
      setWhiteActiveLocal(true);
      setHideWhiteLocal(false);
      setPurpleActiveLocal(false);
      purpleTimeoutLocal.current = setTimeout(() => {
        setHideWhiteLocal(true);
        setPurpleActiveLocal(true);
      }, 3000);
    } else {
      setIsResettingLocal(true);
      setIsHardResetLocal(true);
      setWhiteActiveLocal(false);
      setPurpleActiveLocal(false);
      setHideWhiteLocal(false);
      clearTimeout(purpleTimeoutLocal.current);
      clearTimeout(resetTimeoutLocal.current);
      clearTimeout(hardResetTimeoutLocal.current);
      resetTimeoutLocal.current = setTimeout(() => {
        setIsResettingLocal(false);
      }, 50);
      hardResetTimeoutLocal.current = setTimeout(() => {
        setIsHardResetLocal(false);
      }, 30);
    }
    return () => {
      clearTimeout(purpleTimeoutLocal.current);
      clearTimeout(resetTimeoutLocal.current);
      clearTimeout(hardResetTimeoutLocal.current);
    };
  }, [visibleLocal]);

  return (
    <div
      ref={ref}
      className={`extraordinary-animation-wrapper${
        isHardResetLocal
          ? " extraordinary-animation-reset"
          : isResettingLocal
            ? ""
            : `${whiteActiveLocal ? " extraordinary-animation-active" : ""}${
                purpleActiveLocal
                  ? " extraordinary-animation-active-purple"
                  : ""
              }${hideWhiteLocal ? " extraordinary-animation-hide-white" : ""}`
      } ${className}`}
      style={{
        opacity: visibleLocal ? 1 : 0,
        transform: visibleLocal ? "translateY(0)" : "translateY(40px)",
        transition: "opacity 0.7s, transform 0.7s",
        borderRadius: 3,
        padding: "24px",
        marginBottom: 32,
        ...style,
      }}
    >
      {children}
      <div className="extraordinary-animation-border-top-white" />
      <div className="extraordinary-animation-border-bottom-white" />
      <div className="extraordinary-animation-border-left-white" />
      <div className="extraordinary-animation-border-right-white" />
      <div className="extraordinary-animation-glow-top-white" />
      <div className="extraordinary-animation-glow-bottom-white" />
      <div className="extraordinary-animation-glow-left-white" />
      <div className="extraordinary-animation-glow-right-white" />
      <div className="extraordinary-animation-border-top-purple" />
      <div className="extraordinary-animation-border-bottom-purple" />
      <div className="extraordinary-animation-border-left-purple" />
      <div className="extraordinary-animation-border-right-purple" />
      <div className="extraordinary-animation-glow-top-purple" />
      <div className="extraordinary-animation-glow-bottom-purple" />
      <div className="extraordinary-animation-glow-left-purple" />
      <div className="extraordinary-animation-glow-right-purple" />
    </div>
  );
}

export default function ProjectPage({ params }) {
  const { projectId } = params;
  const [project, setProject] = useState(null);
  const [loaded, setLoaded] = useState({ main: false, files: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      // Fetch only the single project document to avoid loading all docs
      const found = await getProjectById(projectId);
      setProject(found);
      // Debug: log fetched project object and files to console
      // so we can inspect exactly what is returned from the DB.
      // This prints the whole project object and the files array.
      // eslint-disable-next-line no-console
      console.log("Fetched project:", found);
      // eslint-disable-next-line no-console
      console.log("Project files:", found?.files);
      setLoaded({
        main: false,
        files:
          found && found.files ? Array(found.files.length).fill(false) : [],
      });
      setIsLoading(false);
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
    setLoaded((prev) => {
      if (!prev || !prev.files) return prev;
      if (prev.files[idx]) return prev; // already loaded, avoid state update
      const nextFiles = prev.files.map((v, i) => (i === idx ? true : v));
      return { ...prev, files: nextFiles };
    });
  }

  // Info block in-view + animation states (moved to top-level to respect hooks rules)
  const [infoRef, inViewInfo, infoMeasured] = useElementInView(120);
  const [whiteActive, setWhiteActive] = useState(false);
  const [purpleActive, setPurpleActive] = useState(false);
  const [hideWhite, setHideWhite] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isHardReset, setIsHardReset] = useState(false);
  const infoPurpleTimeout = useRef();
  const infoResetTimeout = useRef();
  const infoHardResetTimeout = useRef();

  // derive visible: show on initial page load until measurement completes
  const infoVisible = infoMeasured ? inViewInfo : true;

  useEffect(() => {
    if (infoVisible) {
      setIsResetting(false);
      setIsHardReset(false);
      setWhiteActive(true);
      setHideWhite(false);
      setPurpleActive(false);
      infoPurpleTimeout.current = setTimeout(() => {
        setHideWhite(true);
        setPurpleActive(true);
      }, 3000);
    } else {
      setIsResetting(true);
      setIsHardReset(true);
      setWhiteActive(false);
      setPurpleActive(false);
      setHideWhite(false);
      clearTimeout(infoPurpleTimeout.current);
      clearTimeout(infoResetTimeout.current);
      clearTimeout(infoHardResetTimeout.current);
      infoResetTimeout.current = setTimeout(() => {
        setIsResetting(false);
      }, 50);
      infoHardResetTimeout.current = setTimeout(() => {
        setIsHardReset(false);
      }, 30);
    }
    return () => {
      clearTimeout(infoPurpleTimeout.current);
      clearTimeout(infoResetTimeout.current);
      clearTimeout(infoHardResetTimeout.current);
    };
  }, [infoVisible]);

  // Reusable animated frame component for files and other blocks

  // Helper to get image url from mainImage (supports string or storage reference)
  function getImageUrl(mainImage) {
    if (!mainImage) return "";
    if (typeof mainImage === "string") return mainImage;
    if (mainImage.referencePath) {
      const ref = mainImage.referencePath;
      if (ref.startsWith("http")) return ref;
      const firstSlash = ref.indexOf("/");
      if (firstSlash === -1) return "";
      let bucket = ref.slice(0, firstSlash);
      const path = ref.slice(firstSlash + 1);
      if (bucket.endsWith(".firebasestorage.app")) {
        bucket = bucket.replace(".firebasestorage.app", ".appspot.com");
      }
      if (bucket && path) {
        let url = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(
          path,
        )}?alt=media`;
        if (mainImage.token) {
          url += `&token=${mainImage.token}`;
        }
        return url;
      }
    }
    return "";
  }

  // Preload mainImage so we can show spinner until background is ready
  useEffect(() => {
    if (!project || !project.mainImage) return;
    const url = getImageUrl(project.mainImage);
    if (!url) {
      handleMainImageLoad();
      return;
    }
    const img = new window.Image();
    img.onload = () => handleMainImageLoad();
    img.onerror = () => handleMainImageLoad();
    img.src = url;
    return () => {
      img.onload = null;
      img.onerror = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project]);

  // Background will keep image aspect ratio: width 100% and height auto

  // Convert Firestore timestamp to readable date
  let dateString = "";
  if (project && project.date && project.date.seconds) {
    dateString = new Date(project.date.seconds * 1000).toLocaleDateString();
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080808] text-[#f2f2f2] flex flex-col items-center justify-center">
        <div className="flex items-center justify-center w-full h-full z-20">
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
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#080808] text-[#f2f2f2] flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Projekt nie znaleziony</h1>
        <Link href="/projects" className="text-[#6a00d1]">
          Powrót do projektów
        </Link>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#080808] text-[#f2f2f2] p-0 pt-0 w-full relative"
      style={{ overflow: "hidden" }}
    >
      <div className="w-full flex items-start mt-4" style={{ height: 56 }}>
        <div className="fixed top-28 left-4 z-40">
          <GlitchButton
            styles={{ padding: "0" }}
            text={
              <a
                href="/projects"
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  height: "100%",
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
                    window.location.href = "/projects";
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
              </a>
            }
          />
        </div>
      </div>
      {/* Full-page blurred background using mainImage (repeats, not stretched) */}
      {project.mainImage && (
        <>
          {!loaded.main && (
            <div className="flex items-center justify-center w-full h-full z-20 fixed inset-0">
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
            </div>
          )}

          {/* Background: keep original image plus a separate blurred overlay with edge masks
              to avoid blur bleeding visible bright bands at viewport edges. */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 0,
              pointerEvents: "none",
              overflow: "hidden",
            }}
          >
            {/* base image (no blur) */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url(${getImageUrl(project.mainImage)})`,
                backgroundRepeat: "repeat-y",
                backgroundSize: "100% auto",
                backgroundPosition: "center top",
                transition: "opacity 0.4s ease-in-out",
                opacity: loaded.main ? 1 : 0,
                zIndex: 0,
              }}
            />

            {/* blurred overlay above the base image; use mask to fade edges so blur doesn't create bright bands */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url(${getImageUrl(project.mainImage)})`,
                backgroundRepeat: "repeat-y",
                backgroundSize: "100% auto",
                backgroundPosition: "center top",
                filter: "blur(120px)",
                transform: "scale(1.06)",
                transition: "opacity 0.4s ease-in-out, transform 0.4s",
                opacity: loaded.main ? 1 : 0,
                zIndex: 1,
                pointerEvents: "none",
                // mask fades edges to transparent so the blurred halo is hidden
                maskImage:
                  "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 4%, black 96%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 4%, black 96%, transparent 100%)",
                maskComposite: "intersect",
                WebkitMaskComposite: "source-in",
              }}
            />
          </div>
          {/* no dark overlay: preserve original image brightness while blurred */}
          {/* <div
            aria-hidden
            className=""
            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          /> */}
        </>
      )}
      {/* Animated info block: title, shortDescription, fullDescription */}
      <div
        ref={infoRef}
        className={`extraordinary-animation-wrapper${
          isHardReset
            ? " extraordinary-animation-reset"
            : isResetting
              ? ""
              : `${whiteActive ? " extraordinary-animation-active" : ""}${
                  purpleActive ? " extraordinary-animation-active-purple" : ""
                }${hideWhite ? " extraordinary-animation-hide-white" : ""}`
        } glassmorphism w-full max-w-2xl mx-auto relative`}
        style={{
          opacity: inViewInfo ? 1 : 0,
          transform: inViewInfo ? "translateY(0)" : "translateY(40px)",
          transition: "opacity 0.7s, transform 0.7s",
          // push down so navbar doesn't cover the info block
          marginTop: 120,
          borderRadius: 3,
          padding: "24px",
          marginBottom: 32,
        }}
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-center text-[#f2f2f2] mb-4">
          {project.title}
        </h1>
        <div className="text-lg md:text-xl text-center font-lexend font-light text-gray-300 mb-4">
          {project.shortDescription || "-"}
        </div>
        <div className="whitespace-pre-line text-base md:text-lg font-lexend font-light text-[#f2f2f2]">
          {project.fullDescription || project.fullDesctiption || "-"}
        </div>

        {/* WHITE PHASE borders + glow */}
        <div className="extraordinary-animation-border-top-white" />
        <div className="extraordinary-animation-border-bottom-white" />
        <div className="extraordinary-animation-border-left-white" />
        <div className="extraordinary-animation-border-right-white" />
        <div className="extraordinary-animation-glow-top-white" />
        <div className="extraordinary-animation-glow-bottom-white" />
        <div className="extraordinary-animation-glow-left-white" />
        <div className="extraordinary-animation-glow-right-white" />
        {/* PURPLE PHASE borders + glow */}
        <div className="extraordinary-animation-border-top-purple" />
        <div className="extraordinary-animation-border-bottom-purple" />
        <div className="extraordinary-animation-border-left-purple" />
        <div className="extraordinary-animation-border-right-purple" />
        <div className="extraordinary-animation-glow-top-purple" />
        <div className="extraordinary-animation-glow-bottom-purple" />
        <div className="extraordinary-animation-glow-left-purple" />
        <div className="extraordinary-animation-glow-right-purple" />
      </div>
      {project.files && project.files.length > 0 && (
        <div
          className="pb-6 animate-fade-in md:max-w-[60vw] max-w-[90vw] justify-center mx-auto rounded-[3px]"
          style={{
            animationDelay: "500ms",
            animationFillMode: "both",
          }}
        >
          {/* files list (each file will be wrapped in animated frame) */}
          <ul className="flex flex-col gap-8 mt-4">
            {project.files.map((file, idx) => {
              // collect multiple path/path1/path2... and pair each with its matching type/type1/type2...
              const paths = [];
              const types = [];
              // handle base 'path' key
              if (file.path) {
                paths.push(file.path);
                types.push(file.type || "");
              }
              // handle numbered keys 'path1'..'pathN' and their corresponding 'type1'..'typeN'
              for (let n = 1; ; n++) {
                const pKey = `path${n}`;
                const tKey = `type${n}`;
                if (file[pKey]) {
                  paths.push(file[pKey]);
                  types.push(file[tKey] || "");
                } else {
                  break;
                }
              }

              const getUrl = (p) => {
                if (!p) return null;
                if (typeof p === "string") return p;
                if (p.referencePath) {
                  if (p.referencePath.startsWith("http"))
                    return p.referencePath;
                  const fileName = p.referencePath.split("/").pop();
                  const bucketHost = "vatrovisuals-5eb95.appspot.com";
                  return `https://firebasestorage.googleapis.com/v0/b/${bucketHost}/o/${encodeURIComponent(
                    fileName,
                  )}?alt=media`;
                }
                return null;
              };

              return (
                <li
                  key={idx}
                  className="animate-fade-in"
                  style={{
                    animationDelay: `${600 + idx * 100}ms`,
                    animationFillMode: "both",
                  }}
                >
                  {/* file description shown above the frame (only if present) */}
                  {file.description ? (
                    <div className="mb-3 text-center text-xl font-lexend font-light text-[#f2f2f2]">
                      {file.description}
                    </div>
                  ) : null}

                  <AnimatedFrame style={{ padding: 0 }}>
                    <PreventDownloadWrapper className="w-full rounded-[3px] relative flex flex-col items-center">
                      {!loaded.files[idx] && (
                        <div className="flex items-center justify-center w-full h-full z-20 absolute left-0 top-0 right-0 bottom-0 bg-[#080808]/60">
                          {typeof window !== "undefined" && isIOS() ? (
                            <div
                              style={{
                                width: 48,
                                height: 48,
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

                      {paths.map((p, j) => {
                        const url = getUrl(p);
                        let ext = "";
                        if (url) {
                          const match = url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
                          ext = match ? match[1].toLowerCase() : "";
                        }
                        const typeField = types[j] || "";
                        const isImageLocal =
                          typeField === "image" ||
                          ["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(
                            ext,
                          );
                        const isVideoLocal =
                          typeField === "mp4" ||
                          typeField === "mp4auto" ||
                          ["mp4", "mov", "webm"].includes(ext);
                        const isAuto = typeField === "mp4auto";

                        return (
                          <div key={j} className={j > 0 ? "w-full" : "w-full"}>
                            {isImageLocal && url && (
                              <img
                                src={url}
                                alt={
                                  file.description || `File ${idx + 1}-${j + 1}`
                                }
                                loading="lazy"
                                decoding="async"
                                onLoad={() => handleFileImageLoad(idx)}
                                onError={() => handleFileImageLoad(idx)}
                                style={{
                                  width: "100%",
                                  height: "auto",
                                  borderRadius: "inherit",
                                  display: "block",
                                }}
                              />
                            )}
                            {isVideoLocal && url && (
                              <video
                                src={url}
                                controls={!isAuto}
                                autoPlay={isAuto}
                                muted={isAuto}
                                loop={isAuto}
                                playsInline
                                // ensure webkit inline playback on iOS
                                webkitPlaysInline
                                preload="metadata"
                                style={{
                                  width: "100%",
                                  height: "auto",
                                  borderRadius: "inherit",
                                }}
                                onLoadedData={() => handleFileImageLoad(idx)}
                                onError={() => handleFileImageLoad(idx)}
                              />
                            )}
                            {!isImageLocal && !isVideoLocal && url && (
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2"
                              >
                                Zobacz plik
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </PreventDownloadWrapper>
                  </AnimatedFrame>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
