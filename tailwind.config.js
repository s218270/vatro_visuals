/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        "border-draw-white": {
          "0%": {
            borderColor: "transparent",
            transform: "scaleX(0) scaleY(0)",
          },
          "50%": { borderColor: "#f2f2f2", transform: "scaleX(1) scaleY(0)" },
          "100%": { borderColor: "#f2f2f2", transform: "scaleX(1) scaleY(1)" },
        },
        "border-draw-purple": {
          "0%": {
            borderColor: "transparent",
            transform: "scaleX(0) scaleY(0)",
          },
          "50%": { borderColor: "#a855f7", transform: "scaleX(1) scaleY(0)" },
          "100%": { borderColor: "#a855f7", transform: "scaleX(1) scaleY(1)" },
        },
      },
      animation: {
        "border-white": "border-draw-white 1s ease forwards",
        "border-purple": "border-draw-purple 0.6s ease forwards 1s",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};
