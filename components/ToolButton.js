import AnimatedText from "./AnimatedText";

export default function ToolButton({ icon, label, inView }) {
  return (
    <button
      className={inView ? "appear text-base sm:text-xl" : ""}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "none",
        color: "#f2f2f2",
        borderRadius: "3px",
        padding: "5px 18px",
        border: "none",
        // fontSize: "1rem",
        width: "100%",
        maxWidth: 320,
        justifyContent: "flex-start",
        textAlign: "left",
        boxShadow: "none",
        marginBottom: 5,
      }}
    >
      {icon}
      {/* <span>
        <AnimatedText text={label} inView={inView} as="span" />
      </span> */}
      {label}
    </button>
  );
}
