/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#000000",
        surface: "#0A0A0A",
        elev: "#101010",
        line: "#1F1F1F",
        muted: "#262626",
        sub: "#737373",
        dim: "#A3A3A3",
        text: "#FAFAFA",
        accent: {
          DEFAULT: "#22C55E",
          soft: "#16A34A",
          glow: "#4ADE80",
        },
        warn: "#F59E0B",
        danger: "#EF4444",
        info: "#3B82F6",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      letterSpacing: {
        widest2: "0.18em",
      },
      fontSize: {
        kpi: ["44px", { lineHeight: "1.05", letterSpacing: "-0.02em", fontWeight: "600" }],
        kpiLg: ["56px", { lineHeight: "1.02", letterSpacing: "-0.025em", fontWeight: "600" }],
      },
      borderRadius: {
        xl2: "14px",
      },
    },
  },
  plugins: [],
};
