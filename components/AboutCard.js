import React, { useEffect, useRef, useState } from "react";
import AnimatedText from "./AnimatedText";

function AboutCard({ inView, omnieRef }) {
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
      ref={omnieRef}
      className={`extraordinary-animation-wrapper${
        isHardReset
          ? " extraordinary-animation-reset"
          : isResetting
          ? ""
          : `${whiteActive ? " extraordinary-animation-active" : ""}${
              purpleActive ? " extraordinary-animation-active-purple" : ""
            }${hideWhite ? " extraordinary-animation-hide-white" : ""}`
      } glassmorphism w-full flex flex-col`}
      style={{
        position: "relative",
        borderRadius: 3,
        opacity: inView ? 1 : 0,
        transition: "opacity 0.7s, transform 0.7s",
        height: "unset",
        minHeight: 0,
        transform:
          typeof window !== "undefined" && window.innerWidth >= 1024
            ? inView
              ? "translateX(0)"
              : "translateX(80px)"
            : inView
            ? "translateX(0)"
            : "translateX(60px)",
      }}
    >
      <h2
        className={inView ? "appear text-[48px] lg:text-[72px]" : ""}
        style={{
          margin: 0,
          opacity: 1,
          marginTop: 20,
          marginLeft: 35,
          marginBottom: 10,
          padding: 0,
          //   fontSize: "72px",
          color: "#f2f2f2",
          textAlign: "left",
        }}
      >
        <AnimatedText text="O mnie" inView={inView} as="span" />
      </h2>
      <div
        style={{
          justifyContent: "center",
        }}
      >
        <p
          className={`about-card-text text-base sm:text-xl md:text-lg lg:text-base xl:text-2xl bg-transparent font-lexend font-light text-[#f2f2f2] px-8 py-8 w-full overflow-auto ${
            inView ? "appear" : ""
          }`}
          style={{
            marginTop: 0,
            textAlign: "left",
            minHeight: 0,
            minWidth: 0,
            wordBreak: "break-word",
            whiteSpace: "normal",
          }}
        >
          Cześć! Nazywam się Piotr <b>vatro_visuals</b> Doniek. Jestem{" "}
          <b>motion designerem</b> i <b>grafikiem</b>, który zamienia pomysły w
          angażujące formy wizualne. Uwielbiam tworzyć dynamiczne animacje,
          eksperymentować z formą i szukać najlepszych sposobów na
          przyciągnięcie uwagi. W każdym projekcie stawiam na najwyższą jakość i
          dbałość o detal - to one sprawiają, że praca nabiera charakteru i
          wyróżnia się na tle innych.
          <br></br>
          <br></br>
          Skoro tu jesteś, to znaczy, że szukasz kogoś, kto przedstawi Twoją
          wizję na ekranie. Zapraszam Cię do swojego świata...
          {/* <AnimatedText
            text="Jestem Andrew Tate, były mistrz świata w kickboxingu, przedsiębiorca i twórca treści motywacyjnych. Znany z mojego pewnego siebie podejścia do życia i kontrowersyjnych poglądów, inspiruję ludzi, by dążyli do osiągnięcia sukcesu w każdej dziedzinie. Moje życie to połączenie dyscypliny, ciężkiej pracy i luksusu, które pokazuję, by motywować innych do wyjścia poza swoje granice."
            inView={inView}
            as="span"
            letterDelay={0.012}
          /> */}
        </p>
      </div>
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

export default AboutCard;
