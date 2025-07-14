import React from "react";

export default function GlitchButton({
  onClick,
  text = null,
  children,
  styles = {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px 24px",
  },
}) {
  // If text is provided, render the button as before
  if (text) {
    return (
      <div
        className="unusual-animation-wrapper bg-transparent cursor-pointer"
        style={styles}
        onClick={onClick}
      >
        <div
          className="glitch-stack"
          style={{
            "--stacks": 3,
            width: "100% !important",
            height: "100% !important",
          }}
        >
          <span style={{ "--index": 0, width: "100%", height: "100%" }}>
            {text}
          </span>
          <span style={{ "--index": 1, width: "100%", height: "100%" }}>
            {text}
          </span>
          <span style={{ "--index": 2, width: "100%", height: "100%" }}>
            {text}
          </span>
        </div>

        {/* WHITE PHASE: 4 borders + 4 glow (should be under purple) */}
        <div className="unusual-animation-border-top-white" />
        <div className="unusual-animation-border-bottom-white" />
        <div className="unusual-animation-border-left-white" />
        <div className="unusual-animation-border-right-white" />
        <div className="unusual-animation-glow-top-white" />
        <div className="unusual-animation-glow-bottom-white" />
        <div className="unusual-animation-glow-left-white" />
        <div className="unusual-animation-glow-right-white" />
        {/* PURPLE PHASE: 4 borders + 4 glow (should be above white) */}
        <div className="unusual-animation-border-top-purple" />
        <div className="unusual-animation-border-bottom-purple" />
        <div className="unusual-animation-border-left-purple" />
        <div className="unusual-animation-border-right-purple" />
        <div className="unusual-animation-glow-top-purple" />
        <div className="unusual-animation-glow-bottom-purple" />
        <div className="unusual-animation-glow-left-purple" />
        <div className="unusual-animation-glow-right-purple" />
      </div>
    );
  }
  // If no text, wrap children in the border/glow animation
  return (
    <div className="unusual-animation-wrapper" style={styles} onClick={onClick}>
      {children}

      {/* WHITE PHASE: 4 borders + 4 glow (should be under purple) */}
      <div className="unusual-animation-border-top-white" />
      <div className="unusual-animation-border-bottom-white" />
      <div className="unusual-animation-border-left-white" />
      <div className="unusual-animation-border-right-white" />
      <div className="unusual-animation-glow-top-white" />
      <div className="unusual-animation-glow-bottom-white" />
      <div className="unusual-animation-glow-left-white" />
      <div className="unusual-animation-glow-right-white" />
      {/* PURPLE PHASE: 4 borders + 4 glow (should be above white) */}
      <div className="unusual-animation-border-top-purple" />
      <div className="unusual-animation-border-bottom-purple" />
      <div className="unusual-animation-border-left-purple" />
      <div className="unusual-animation-border-right-purple" />
      <div className="unusual-animation-glow-top-purple" />
      <div className="unusual-animation-glow-bottom-purple" />
      <div className="unusual-animation-glow-left-purple" />
      <div className="unusual-animation-glow-right-purple" />
    </div>
  );
}
