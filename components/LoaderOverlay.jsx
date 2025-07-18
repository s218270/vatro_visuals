import React from "react";

export default function LoaderOverlay() {
  const [isClient, setIsClient] = React.useState(false);
  const [isIos, setIsIos] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
    const iOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.userAgent.includes("Mac") && "ontouchend" in document);
    setIsIos(iOS);
  }, []);

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#080808] bg-opacity-90 pointer-events-auto">
      {isClient ? (
        isIos ? (
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
        )
      ) : null}
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
