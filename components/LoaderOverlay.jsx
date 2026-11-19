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
          <img
            src="/Loading_WWW-ezgif.com-optimize (1).gif"
            alt=""
            style={{
              width: 96,
              height: 96,
              objectFit: "contain",
              background: "none",
            }}
          />
        ) : (
          <img
            src="/Loading_WWW-ezgif.com-optimize (1).gif"
            alt=""
            style={{
              width: 96,
              height: 96,
              objectFit: "contain",
              background: "none",
            }}
          />
        )
      ) : null}
    </div>
  );
}
