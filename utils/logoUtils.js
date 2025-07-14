// Utility functions for LogoAnimation and related components

export function isIOS() {
  if (typeof window === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  );
}

export function isMobile() {
  if (typeof window === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

export function getResponsiveRadius(base) {
  if (typeof window === "undefined") return base;
  return window.innerWidth < 768 ? base * 1.3 : base;
}
