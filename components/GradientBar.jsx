import React from "react";

export default function GradientBar() {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: "30vh",
        pointerEvents: "none",
        zIndex: 10, // below scroll button
        background:
          "linear-gradient(to bottom, rgba(8,8,8,0) 0%, #080808 100%)",
      }}
    />
  );
}
