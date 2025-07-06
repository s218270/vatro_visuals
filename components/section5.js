"use client";
import { useState, useEffect, useRef } from "react";
import AnimatedText from "./AnimatedText";

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

  return (
    <section
      id="section5"
      className="min-h-screen w-full bg-black flex flex-col items-center justify-center relative px-2 sm:px-6 md:px-12 lg:px-24 xl:px-32"
    >
      <h1 className="text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-8 appear">
        <AnimatedText text="Kontakt" inView={true} as="span" />
      </h1>

      <div
        ref={formRef}
        className={`button-border-scroll border-3x-slow glassmorphism w-full max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl relative ${
          inViewForm ? "active appear" : ""
        }`}
        style={{
          opacity: inViewForm ? 1 : 0,
          transform: inViewForm ? "translateY(0)" : "translateY(60px)",
          transition: "opacity 0.7s, transform 0.7s",
          borderRadius: 3,
          marginBottom: 48,
        }}
      >
        {isSubmitted ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative appear text-base sm:text-lg md:text-xl lg:text-2xl">
            <AnimatedText
              text="Wiadomość wysłana pomyślnie!"
              inView={inViewForm}
              as="span"
            />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-6 sm:gap-8 md:gap-10 p-4 sm:p-8 md:p-12 lg:p-16 bg-transparent"
            style={{ boxShadow: "none", border: "none" }}
          >
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded appear text-base sm:text-lg md:text-xl lg:text-2xl">
                <AnimatedText text={error} inView={inViewForm} as="span" />
              </div>
            )}
            {/* Email field */}
            <div
              className={`button-border-scroll border-3x-slow relative ${
                inViewForm ? "active appear" : ""
              }`}
              style={{ borderRadius: 3, padding: 0 }}
            >
              <label
                htmlFor="email"
                className="block text-sm sm:text-base md:text-lg lg:text-xl font-medium text-gray-500 appear"
                style={{
                  marginLeft: 12,
                  marginTop: 8,
                  zIndex: 2,
                  position: "relative",
                }}
              >
                <AnimatedText text="Email" inView={inViewForm} as="span" />
              </label>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                className="button-border-content text-white p-3 sm:p-4 md:p-5 w-full rounded-md transition-colors duration-200 focus:outline-none placeholder-gray-400 sm:text-base md:text-lg lg:text-xl"
                placeholder="Twój email"
                style={{
                  border: "none",
                  boxShadow: "none",
                  position: "relative",
                  zIndex: 1, // Lower z-index so border is above
                  minHeight: 48,
                  fontSize: "1.1rem",
                  background: "rgba(20,20,20,1)",
                  width: "calc(100% - 4px)", // 2px border on each side
                  left: 2,
                }}
                onFocus={(e) =>
                  (e.target.style.background = "rgba(30,30,30,1)")
                }
                onBlur={(e) => (e.target.style.background = "rgba(20,20,20,1)")}
                required
              />
              {/* Border lines below input */}
              <div
                className="border-line border-white-1"
                style={{ borderTopWidth: "4px", borderLeftWidth: "4px" }}
              ></div>
              <div
                className="border-line border-white-2"
                style={{ borderBottomWidth: "4px", borderRightWidth: "4px" }}
              ></div>
              {/* White Glow */}
              <div
                className="border-white-glow-top"
                style={{ height: "4px" }}
              ></div>
              <div
                className="border-white-glow-right"
                style={{ width: "4px" }}
              ></div>
              <div
                className="border-white-glow-bottom"
                style={{ height: "4px" }}
              ></div>
              <div
                className="border-white-glow-left"
                style={{ width: "4px" }}
              ></div>
              <div
                className="border-line border-purple-1"
                style={{ borderTopWidth: "4px", borderLeftWidth: "4px" }}
              ></div>
              <div
                className="border-line border-purple-2"
                style={{ borderBottomWidth: "4px", borderRightWidth: "4px" }}
              ></div>
              {/* Purple Glow */}
              <div
                className="border-purple-glow-top"
                style={{ height: "4px" }}
              ></div>
              <div
                className="border-purple-glow-right"
                style={{ width: "4px" }}
              ></div>
              <div
                className="border-purple-glow-bottom"
                style={{ height: "4px" }}
              ></div>
              <div
                className="border-purple-glow-left"
                style={{ width: "4px" }}
              ></div>
            </div>
            {/* Message field */}
            <div
              className={`button-border-scroll border-3x-slow relative ${
                inViewForm ? "active appear" : ""
              }`}
              style={{ borderRadius: 3, padding: 0 }}
            >
              <label
                htmlFor="message"
                className="block text-sm sm:text-base md:text-lg lg:text-xl font-medium text-gray-500 appear"
                style={{
                  marginLeft: 12,
                  marginTop: 8,
                  zIndex: 2,
                  position: "relative",
                }}
              >
                <AnimatedText text="Wiadomość" inView={inViewForm} as="span" />
              </label>
              <textarea
                id="message"
                name="message"
                className="button-border-content text-white p-3 sm:p-4 md:p-5 w-full rounded-md transition-colors duration-200 focus:outline-none placeholder-gray-400 sm:text-base md:text-lg lg:text-xl"
                placeholder="Treść wiadomości"
                rows="5"
                style={{
                  border: "none",
                  boxShadow: "none",
                  position: "relative",
                  zIndex: 1, // Lower z-index so border is above
                  minHeight: 120,
                  fontSize: "1.1rem",
                  background: "rgba(20,20,20,1)",
                  width: "calc(100% - 4px)",
                  left: 2,
                }}
                onFocus={(e) =>
                  (e.target.style.background = "rgba(30,30,30,1)")
                }
                onBlur={(e) => (e.target.style.background = "rgba(20,20,20,1)")}
                required
              ></textarea>
              {/* Border lines below textarea */}
              <div
                className="border-line border-white-1"
                style={{ borderTopWidth: "4px", borderLeftWidth: "4px" }}
              ></div>
              <div
                className="border-line border-white-2"
                style={{ borderBottomWidth: "4px", borderRightWidth: "4px" }}
              ></div>
              {/* White Glow */}
              <div
                className="border-white-glow-top"
                style={{ height: "4px" }}
              ></div>
              <div
                className="border-white-glow-right"
                style={{ width: "4px" }}
              ></div>
              <div
                className="border-white-glow-bottom"
                style={{ height: "4px" }}
              ></div>
              <div
                className="border-white-glow-left"
                style={{ width: "4px" }}
              ></div>
              <div
                className="border-line border-purple-1"
                style={{ borderTopWidth: "4px", borderLeftWidth: "4px" }}
              ></div>
              <div
                className="border-line border-purple-2"
                style={{ borderBottomWidth: "4px", borderRightWidth: "4px" }}
              ></div>
              {/* Purple Glow */}
              <div
                className="border-purple-glow-top"
                style={{ height: "4px" }}
              ></div>
              <div
                className="border-purple-glow-right"
                style={{ width: "4px" }}
              ></div>
              <div
                className="border-purple-glow-bottom"
                style={{ height: "4px" }}
              ></div>
              <div
                className="border-purple-glow-left"
                style={{ width: "4px" }}
              ></div>
            </div>
            {/* Submit button */}
            <div className="button-border-wrapper mt-6 md:mt-8">
              <button
                type="submit"
                className="button-border-content bg-black p-4 sm:p-5 md:p-6 rounded-full text-base sm:text-lg md:text-xl lg:text-2xl"
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  minHeight: 56,
                  fontSize: "1.2rem",
                }}
                onMouseLeave={(e) => {
                  const purple = e.currentTarget.querySelector(
                    ".glitch-text-purple"
                  );
                  if (!purple) return;
                  purple.classList.remove("glitch-done");
                  purple.classList.add("glitch-out");
                  purple.addEventListener(
                    "animationend",
                    () => {
                      purple.classList.remove("glitch-out");
                      purple.classList.add("glitch-done");
                    },
                    { once: true }
                  );
                }}
              >
                <span
                  className="glitch-text-white"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <AnimatedText text="Wyślij" inView={inViewForm} as="span" />
                </span>
                <span
                  className="glitch-text-purple"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <AnimatedText text="Wyślij" inView={inViewForm} as="span" />
                </span>
              </button>
              <div className="border-line border-white-1"></div>
              <div className="border-line border-white-2"></div>
              {/* White Glow */}
              <div className="border-white-glow-top"></div>
              <div className="border-white-glow-right"></div>
              <div className="border-white-glow-bottom"></div>
              <div className="border-white-glow-left"></div>
              <div className="border-line border-purple-1"></div>
              <div className="border-line border-purple-2"></div>
              {/* Purple Glow */}
              <div className="border-purple-glow-top"></div>
              <div className="border-purple-glow-right"></div>
              <div className="border-purple-glow-bottom"></div>
              <div className="border-purple-glow-left"></div>
            </div>
          </form>
        )}
        {/* Border lines for the whole form */}
        <div className="border-line border-white-1"></div>
        <div className="border-line border-white-2"></div>
        {/* White Glow */}
        <div className="border-white-glow-top"></div>
        <div className="border-white-glow-right"></div>
        <div className="border-white-glow-bottom"></div>
        <div className="border-white-glow-left"></div>
        <div className="border-line border-purple-1"></div>
        <div className="border-line border-purple-2"></div>
        {/* Purple Glow */}
        <div className="border-purple-glow-top"></div>
        <div className="border-purple-glow-right"></div>
        <div className="border-purple-glow-bottom"></div>
        <div className="border-purple-glow-left"></div>
      </div>

      {/* Social media icons remain the same */}
      <div className="flex flex-row mt-3 gap-3">
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
      </div>
      {/* Scroll to LogoAnimation button */}
      <div
        className="button-border-wrapper"
        style={{
          position: "absolute",
          zIndex: 30,
          bottom: 40,
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="button-border-content bg-black p-4 rounded-full"
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseLeave={(e) => {
            const purple = e.currentTarget.querySelector(".glitch-text-purple");
            if (!purple) return;
            purple.classList.remove("glitch-done");
            purple.classList.add("glitch-out");
            purple.addEventListener(
              "animationend",
              () => {
                purple.classList.remove("glitch-out");
                purple.classList.add("glitch-done");
              },
              { once: true }
            );
          }}
        >
          <span
            className="glitch-text-white"
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="w-6 h-6 text-white"
              style={{ transform: "rotate(180deg)" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </span>
          <span
            className="glitch-text-purple"
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="w-6 h-6 text-[#a259f7]"
              style={{ transform: "rotate(180deg)" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </span>
        </button>
        <div className="border-line border-white-1"></div>
        <div className="border-line border-white-2"></div>
        {/* White Glow */}
        <div className="border-white-glow-top"></div>
        <div className="border-white-glow-right"></div>
        <div className="border-white-glow-bottom"></div>
        <div className="border-white-glow-left"></div>
        <div className="border-line border-purple-1"></div>
        <div className="border-line border-purple-2"></div>
        {/* Purple Glow */}
        <div className="border-purple-glow-top"></div>
        <div className="border-purple-glow-right"></div>
        <div className="border-purple-glow-bottom"></div>
        <div className="border-purple-glow-left"></div>
      </div>
    </section>
  );
}
