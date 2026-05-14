/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#070A12",
          900: "#0B1020",
          800: "#111733",
          700: "#1A2244",
          600: "#252E5C",
        },
        accent: {
          400: "#7CFFCB",
          500: "#34E0A1",
          600: "#13B981",
        },
        glow: {
          violet: "#8B5CF6",
          cyan: "#22D3EE",
          pink: "#F472B6",
        },
      },
      fontFamily: {
        display: ["Inter", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(124,255,203,0.15), 0 10px 40px -10px rgba(52,224,161,0.35)",
        soft: "0 8px 32px -12px rgba(0,0,0,0.4)",
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(ellipse at top, rgba(139,92,246,0.18), transparent 60%), radial-gradient(ellipse at bottom right, rgba(34,211,238,0.12), transparent 60%)",
      },
    },
  },
  plugins: [],
};
