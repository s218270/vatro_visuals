import AnimatedText from "./AnimatedText";

export default function ToolButton({ icon, label, inView }) {
  return (
    <button
      className={inView ? "appear" : ""}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "none",
        color: "#f2f2f2",
        borderRadius: 8,
        padding: "10px 18px",
        border: "none",
        fontWeight: 500,
        fontSize: "1rem",
        width: "100%",
        maxWidth: 320,
        justifyContent: "flex-start",
        textAlign: "left",
        boxShadow: "none",
        marginBottom: 5,
      }}
    >
      {icon}
      <span>
        <AnimatedText text={label} inView={inView} as="span" />
      </span>
    </button>
  );
}
