import React, { useEffect, useRef, useState } from "react";

const ImageCard = ({ inView, imageRef }) => {
  const [whiteActive, setWhiteActive] = useState(false);
  const [purpleActive, setPurpleActive] = useState(false);
  const [hideWhite, setHideWhite] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isHardReset, setIsHardReset] = useState(false);
  const purpleTimeout = useRef();
  const resetTimeout = useRef();
  const hardResetTimeout = useRef();

  useEffect(() => {
    if (inView) {
      setIsResetting(false);
      setIsHardReset(false);
      setWhiteActive(true);
      setHideWhite(false);
      setPurpleActive(false);
      purpleTimeout.current = setTimeout(() => {
        setHideWhite(true);
        setPurpleActive(true);
      }, 3000);
    } else {
      setIsResetting(true);
      setIsHardReset(true);
      setWhiteActive(false);
      setPurpleActive(false);
      setHideWhite(false);
      clearTimeout(purpleTimeout.current);
      clearTimeout(resetTimeout.current);
      clearTimeout(hardResetTimeout.current);
      resetTimeout.current = setTimeout(() => {
        setIsResetting(false);
      }, 50);
      hardResetTimeout.current = setTimeout(() => {
        setIsHardReset(false);
      }, 30);
    }
    return () => {
      clearTimeout(purpleTimeout.current);
      clearTimeout(resetTimeout.current);
      clearTimeout(hardResetTimeout.current);
    };
  }, [inView]);

  return (
    <div
      ref={imageRef}
      className={`extraordinary-animation-wrapper${
        isHardReset
          ? " extraordinary-animation-reset"
          : isResetting
          ? ""
          : `${whiteActive ? " extraordinary-animation-active" : ""}${
              purpleActive ? " extraordinary-animation-active-purple" : ""
            }${hideWhite ? " extraordinary-animation-hide-white" : ""}`
      } p-[2px] portrait-lg glassmorphism w-full aspect-[4/5] max-w-full sm:max-h-[450px] md:max-h-[400px] lg:row-span-2 lg:col-span-1 lg:w-full lg:max-w-full lg:max-h-full`}
      style={{
        position: "relative",
        opacity: inView ? 1 : 0,
        transition: "opacity 0.7s, transform 0.7s",
        transform:
          typeof window !== "undefined" && window.innerWidth >= 1024
            ? inView
              ? "translateX(0)"
              : "translateX(-80px)"
            : inView
            ? "translateX(0)"
            : "translateX(-60px)",
      }}
    >
      <Image
        src="/Andrew.webp"
        alt="Andrew"
        width={600}
        height={800}
        className="w-full object-cover"
        style={{
          objectFit: "cover",
          width: "100%",
          height: "100%",
          maxHeight: "100%",
          minHeight: 0,
          minWidth: 0,
          background: "#292929",
          opacity: 1,
          borderRadius: "0px",
          position: "relative",
          zIndex: 2,
        }}
      />
      {/* WHITE PHASE: 4 borders + 4 glow (should be under purple) */}
      <div className="extraordinary-animation-border-top-white" />
      <div className="extraordinary-animation-border-bottom-white" />
      <div className="extraordinary-animation-border-left-white" />
      <div className="extraordinary-animation-border-right-white" />
      <div className="extraordinary-animation-glow-top-white" />
      <div className="extraordinary-animation-glow-bottom-white" />
      <div className="extraordinary-animation-glow-left-white" />
      <div className="extraordinary-animation-glow-right-white" />
      {/* PURPLE PHASE: 4 borders + 4 glow (should be above white) */}
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
};

export default ImageCard;
