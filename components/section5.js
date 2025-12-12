"use client";
import { useState, useEffect, useRef } from "react";
import AnimatedText from "./AnimatedText";
import GlitchButton from "./GlitchButton";

function useInView(ref, offset = 200) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    function onScroll() {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const isVisible =
        rect.top < window.innerHeight - offset && rect.bottom > offset;
      setInView(isVisible);
    }
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [ref, offset]);
  return inView;
}

export default function Section5() {
  const [whiteActive, setWhiteActive] = useState(false);
  const [purpleActive, setPurpleActive] = useState(false);
  const [hideWhite, setHideWhite] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isHardReset, setIsHardReset] = useState(false);
  const purpleTimeout = useRef();
  const resetTimeout = useRef();
  const hardResetTimeout = useRef();

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef(null);
  const inViewForm = useInView(formRef, 120);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.target);

    try {
      const response = await fetch("https://formspree.io/f/mpwpabqg", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.get("email"),
          message: formData.get("message"), // Only include fields that exist in the form
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        e.target.reset();
      } else {
        setError(data.error || "Wystąpił błąd podczas wysyłania formularza");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setError("Wystąpił błąd połączenia");
    }
  };

  useEffect(() => {
    if (inViewForm) {
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
  }, [inViewForm]);

  return (
    <section
      id="section5"
      className="min-h-screen w-full bg-[#080808] flex flex-col items-center justify-center relative px-2 sm:px-6 md:px-12 lg:px-24 xl:px-32 z-10"
      style={{
        backgroundImage: "url('/Cave.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Gradient overlays for top/bottom fade */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "30vh",
          zIndex: 10,
          pointerEvents: "none",
          background:
            "linear-gradient(to bottom, #080808 0%, transparent 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "30vh",
          zIndex: 10,
          pointerEvents: "none",
          background: "linear-gradient(to top, #080808 0%, transparent 100%)",
        }}
      />
      <h1 className="text-[#f2f2f2] text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-12 appear">
        {/* <AnimatedText text="Kontakt" inView={true} as="span" /> */}
        KONTAKT
      </h1>

      <div
        ref={formRef}
        className={`extraordinary-animation-wrapper${
          isHardReset
            ? " extraordinary-animation-reset"
            : isResetting
            ? ""
            : `${whiteActive ? " extraordinary-animation-active" : ""}${
                purpleActive ? " extraordinary-animation-active-purple" : ""
              }${hideWhite ? " extraordinary-animation-hide-white" : ""}`
        } glassmorphism w-full max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl relative`}
        style={{
          opacity: inViewForm ? 1 : 0,
          transform: inViewForm ? "translateY(0)" : "translateY(60px)",
          transition: "opacity 0.7s, transform 0.7s",
          borderRadius: 3,
          marginBottom: 48,
        }}
      >
        {isSubmitted ? (
          <div className="bg-[#6a00d1] border border-[#f2f2f2] text-[#f2f2f2] font-lexend font-light px-4 py-3 rounded-[3px] relative appear text-base sm:text-lg md:text-xl lg:text-2xl">
            {/* <AnimatedText
              text="Wiadomość wysłana pomyślnie!"
              inView={inViewForm}
              as="span"
            /> */}
            Wiadomość wysłana pomyślnie!
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-6 sm:gap-8 md:gap-10 p-4 sm:p-8 md:p-12 lg:p-16 bg-transparent"
            style={{ boxShadow: "none", border: "none" }}
          >
            {error && (
              <div className="bg-[#f2f2f2] border border-[#6a00d1] text-[#6a00d1] px-4 py-3 rounded-[3px] font-lexend font-light appear text-base sm:text-lg md:text-xl lg:text-2xl">
                {/* <AnimatedText text={error} inView={inViewForm} as="span" /> */}
                {error}
              </div>
            )}
            {/* Email field */}
            <div style={{ borderRadius: 3, padding: 0 }}>
              <label
                htmlFor="email"
                className="block text-base sm:text-lg md:text-xl lg:text-2xl font-medium text-gray-500 appear"
                style={{
                  marginLeft: 12,
                  marginTop: 8,
                  zIndex: 2,
                  position: "relative",
                  marginBottom: 8,
                }}
              >
                {/* <AnimatedText text="Email" inView={inViewForm} as="span" /> */}
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                className="text-[#f2f2f2] p-3 sm:p-4 md:p-5 w-full rounded-[3px] font-lexend font-light transition-colors duration-200 focus:outline-none placeholder-gray-400 sm:text-base md:text-lg lg:text-xl"
                placeholder="Twój email"
                style={{
                  border: "none",
                  boxShadow: "none",
                  position: "relative",
                  zIndex: 1, // Lower z-index so border is above
                  minHeight: 48,
                  fontSize: "1.1rem",
                  background: "rgba(31,31,31,1)",
                  width: "calc(100% - 4px)", // 2px border on each side
                  left: 2,
                }}
                onFocus={(e) =>
                  (e.target.style.background = "rgba(20,20,20,1)")
                }
                onBlur={(e) => (e.target.style.background = "rgba(31,31,31,1)")}
                required
              />
            </div>
            {/* Message field */}
            <div style={{ borderRadius: 3, padding: 0 }}>
              <label
                htmlFor="message"
                className="block text-base sm:text-lg md:text-xl lg:text-2xl font-medium text-gray-500 appear"
                style={{
                  marginLeft: 12,
                  marginTop: 8,
                  zIndex: 2,
                  position: "relative",
                  marginBottom: 8,
                }}
              >
                {/* <AnimatedText text="Wiadomość" inView={inViewForm} as="span" /> */}
                Wiadomość
              </label>
              <textarea
                id="message"
                name="message"
                className="text-[#f2f2f2] p-3 sm:p-4 md:p-5 w-full rounded-[3px] font-lexend font-light transition-colors duration-200 focus:outline-none placeholder-gray-400 sm:text-base md:text-lg lg:text-xl"
                placeholder="Treść wiadomości"
                rows="5"
                style={{
                  border: "none",
                  boxShadow: "none",
                  position: "relative",
                  zIndex: 1, // Lower z-index so border is above
                  minHeight: 120,
                  fontSize: "1.1rem",
                  background: "rgba(31,31,31,1)",
                  width: "calc(100% - 4px)",
                  left: 2,
                }}
                onFocus={(e) =>
                  (e.target.style.background = "rgba(20,20,20,1)")
                }
                onBlur={(e) => (e.target.style.background = "rgba(31,31,31,1)")}
                required
              ></textarea>
            </div>
            {/* Submit button */}
            <div className="mt-6 md:mt-8 justify-center flex items-center">
              <GlitchButton
                style={{ width: "100%" }}
                text={<button type="submit">Wyślij</button>}
              />
            </div>
          </form>
        )}
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

      {/* Social media icons remain the same */}
      {/* <div className="flex flex-row mt-3 gap-3">
        <a
          href="https://facebook.com"
          className="hover:scale-110 transform transition"
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg"
            alt="Facebook"
            className="w-10 h-10"
          />
        </a>
        <a
          href="https://www.instagram.com/vatro_visuals/?hl=pl"
          className="hover:scale-110 transform transition"
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"
            alt="Instagram"
            className="w-10 h-10"
          />
        </a>
        <a
          href="https://youtube.com"
          className="hover:scale-110 transform transition"
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/4/42/YouTube_icon_%282013-2017%29.png"
            alt="YouTube"
            className="w-10 h-10"
          />
        </a>
      </div> */}
      {/* Scroll to LogoAnimation button */}

      <div
        style={{
          position: "absolute",
          zIndex: 30,
          bottom: 40,
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <GlitchButton
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          text={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="w-6 h-6 text-[#f2f2f2]"
              style={{ transform: "rotate(180deg)" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          }
        />
      </div>
    </section>
  );
}
