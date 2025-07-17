import React, { useEffect, useRef, useState } from "react";
import AnimatedText from "./AnimatedText";
import ToolsList from "./ToolsList";

export default function ToolsCard({ inView, toolsRef }) {
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
      ref={toolsRef}
      className={`extraordinary-animation-wrapper${
        isHardReset
          ? " extraordinary-animation-reset"
          : isResetting
          ? ""
          : `${whiteActive ? " extraordinary-animation-active" : ""}${
              purpleActive ? " extraordinary-animation-active-purple" : ""
            }${hideWhite ? " extraordinary-animation-hide-white" : ""}`
      } glassmorphism w-full max-w-full h-[450px] md:h-[400px] lg:col-span-2 lg:row-span-1 flex flex-col`}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        maxWidth: "100%",
        borderRadius: 3,
        opacity: inView ? 1 : 0,
        transition: "opacity 0.7s, transform 0.7s",
        transform:
          typeof window !== "undefined" && window.innerWidth >= 1024
            ? inView
              ? "translateX(0)"
              : "translateX(80px)"
            : inView
            ? "translateX(0)"
            : "translateX(-60px)",
      }}
    >
      <h3
        className={inView ? "appear" : ""}
        style={{
          marginTop: 20,
          marginLeft: 35,
          color: "#f2f2f2",
          fontSize: "30px",
          marginBottom: 20,
          textAlign: "left",
          opacity: 1,
        }}
      >
        <AnimatedText text="Narzędzia" inView={inView} as="span" />
      </h3>
      <ToolsList inView={inView} />
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
}
