"use client";
import React from "react";

export default function PreventDownloadWrapper({
  children,
  className = "",
  style = {},
}) {
  const handleContextMenu = (e) => {
    e.preventDefault();
  };

  const handleDragStart = (e) => {
    e.preventDefault();
  };

  return (
    <div
      className={className}
      style={style}
      onContextMenu={handleContextMenu}
      onDragStart={handleDragStart}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        const type = child.type;
        // If child is a plain img or video element, ensure it is not draggable
        if (type === "img" || type === "video") {
          return React.cloneElement(child, {
            draggable: false,
            onContextMenu: handleContextMenu,
            onDragStart: handleDragStart,
          });
        }
        return child;
      })}
    </div>
  );
}
