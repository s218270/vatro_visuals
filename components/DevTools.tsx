"use client";

import { useEffect } from "react";

export default function DevTools() {
  useEffect(() => {
    import("eruda").then((eruda) => {
      eruda.default.init();
    });
  }, []);

  return null;
}
