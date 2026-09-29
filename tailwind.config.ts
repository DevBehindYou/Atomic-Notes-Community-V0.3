import type { Config } from "tailwindcss";

// Technical Editorial palette, matched to the Atomic Notes app
// (ink #15171B, paper #F4F5F1, signal #3A2FF0).
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#15171B",
        paper: "#F4F5F1",
        signal: "#3A2FF0",
        slate: "#4A4D55",
        line: "#C6C6CB",
        surface: "#EDEEE8",
        low: "#601D49",
        high: "#EB7D00",
      },
      fontFamily: {
        display: ["var(--font-bebas)", "sans-serif"],
        body: ["var(--font-hanken)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        std: "4px",
      },
    },
  },
  plugins: [],
};

export default config;
