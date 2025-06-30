import ToolButton from "./ToolButton";

const tools = [
  {
    label: "Photoshop",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#001E36" />
        <text
          x="4"
          y="18"
          fontSize="14"
          fill="#31A8FF"
          fontFamily="Arial, Helvetica, sans-serif"
        >
          Ps
        </text>
      </svg>
    ),
  },
  {
    label: "Blender",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#F5792A" />
        <circle cx="12" cy="12" r="5" fill="#fff" />
        <circle cx="12" cy="12" r="2" fill="#F5792A" />
      </svg>
    ),
  },
  {
    label: "Lightroom",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#001E36" />
        <text
          x="4"
          y="18"
          fontSize="14"
          fill="#31A8FF"
          fontFamily="Arial, Helvetica, sans-serif"
        >
          Lr
        </text>
      </svg>
    ),
  },
];

export default function ToolsList({ inView }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        width: "100%",
        paddingLeft: 35,
      }}
    >
      {tools.map((tool) => (
        <ToolButton
          key={tool.label}
          icon={tool.icon}
          label={tool.label}
          inView={inView}
        />
      ))}
    </div>
  );
}
