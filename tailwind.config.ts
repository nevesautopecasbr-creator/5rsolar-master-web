import type { Config } from "tailwindcss";

/**
 * Tokens de Design - 5R Energia Solar
 * Paleta oficial: Laranja + Escuro/Marinho + Verde (destaque secundário)
 */
const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Cores primárias da marca 5R */
        brand: {
          orange: {
            DEFAULT: "#E85D04",
            light: "#F48C06",
            dark: "#DC2F02",
            50: "#FFF5F0",
            100: "#FFE8DB",
            200: "#FFD4C2",
            300: "#FFB088",
            400: "#FF8B4D",
            500: "#E85D04",
            600: "#DC2F02",
            700: "#B91C1C",
            800: "#9A3412",
            900: "#7C2D12",
          },
          navy: {
            DEFAULT: "#1E3A5F",
            light: "#2D4A6F",
            dark: "#152A45",
            50: "#F0F4F8",
            100: "#D9E2EC",
            200: "#BCCCDC",
            300: "#9FB3C8",
            400: "#829AB1",
            500: "#627D98",
            600: "#486581",
            700: "#334E68",
            800: "#1E3A5F",
            900: "#152A45",
          },
          green: {
            DEFAULT: "#7CB342",
            light: "#9CCC65",
            dark: "#558B2F",
          },
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        display: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["2.25rem", { lineHeight: "1.2", fontWeight: "700" }],
        "display-lg": ["1.875rem", { lineHeight: "1.25", fontWeight: "600" }],
        "display-md": ["1.5rem", { lineHeight: "1.3", fontWeight: "600" }],
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        "card-hover": "0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.04)",
        "brand-orange": "0 2px 8px -2px rgb(232 93 4 / 0.4)",
      },
      transitionDuration: {
        DEFAULT: "200ms",
      },
    },
  },
  plugins: [],
};

export default config;
