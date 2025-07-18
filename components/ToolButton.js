"use client";
import AnimatedText from "./AnimatedText";
import { useState } from "react";

export default function ToolButton({ icon, label, inView }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={inView ? "appear text-sm sm:text-base" : ""}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        // gap: 12,
        background: "none",
        color: "#f2f2f2",
        borderRadius: "3px",
        // padding: "0px 5px",
        border: "none",
        // fontSize: "1rem",
        // width: "100%",
        maxWidth: 320,
        // justifyContent: "flex-start",
        // textAlign: "left",
        boxShadow: "none",
        transition: "scale 0.3s ease-out",
        scale: isHovered ? 0.9 : 1,
        // marginBottom: 5,
      }}
    >
      {icon}
      <div
        // className={isHovered ? `visible` : `hidden`}
        style={{
          position: "absolute",
          opacity: isHovered ? 1 : 0,
          top: "48px",
          textWrap: "nowrap",
          alignSelf: "center",
          transition: "opacity 0.3s ease-out, transform 0.3s ease-out",
          transform: isHovered ? "translateY(8px)" : "translateY(-16px)",
        }}
      >
        {label}
      </div>
      {/* <span>
        <AnimatedText text={label} inView={inView} as="span" />
      </span> */}
    </button>
  );
}
