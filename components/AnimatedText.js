// AnimatedText: litera po literze fade-in, z obsługą word-break dla contentu
export default function AnimatedText({
  text,
  className = "",
  style = {},
  inView,
  as = "span",
  letterDelay = 0.04,
  breakWords = false,
}) {
  const Tag = as;
  if (breakWords) {
    // Dziel po słowie, ale animuj litery
    return (
      <Tag
        className={className}
        style={{
          ...style,
          display: "inline",
          wordBreak: "break-word",
          whiteSpace: "normal",
        }}
      >
        {text.split(" ").map((word, wi) => (
          <span key={wi} style={{ display: "inline" }}>
            {word.split("").map((char, i) => (
              <span
                key={i}
                style={{
                  opacity: inView ? 1 : 0,
                  display: "inline",
                  transition: "opacity 0.2s cubic-bezier(0.4,0,0.2,1)",
                  transitionDelay: inView
                    ? `${(wi * 7 + i) * letterDelay}s`
                    : "0s",
                  willChange: "opacity",
                }}
              >
                {char}
              </span>
            ))}{" "}
          </span>
        ))}
      </Tag>
    );
  }
  // Standardowo po literze
  return (
    <Tag className={className} style={{ ...style, display: "inline" }}>
      {text.split("").map((char, i) => (
        <span
          key={i}
          style={{
            opacity: inView ? 1 : 0,
            display: "inline",
            transition: "opacity 0.3s cubic-bezier(0.4,0,0.2,1)",
            transitionDelay: inView ? `${i * letterDelay}s` : "0s",
            willChange: "opacity",
          }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </Tag>
  );
}
