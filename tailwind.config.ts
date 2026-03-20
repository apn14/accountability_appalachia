import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "var(--cream)",
        sand: "var(--sand)",
        ink: "var(--ink)",
        moss: "var(--moss)",
        rust: "var(--rust)",
        gold: "var(--gold)",
        muted: "var(--muted)",
        border: "var(--border)"
      },
      boxShadow: {
        soft: "0 20px 40px rgba(20, 35, 29, 0.08)"
      },
      fontFamily: {
        serif: ["var(--font-fraunces)"],
        sans: ["var(--font-public-sans)"]
      }
    }
  },
  plugins: []
};

export default config;

