import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        nyaya: {
          dark: "#0a0f1d",
          card: "#121a2f",
          surface: "#18223d",
          border: "#243256",
          gold: "#f59e0b",
          goldLight: "#fef3c7",
          saffron: "#ff7722",
          chakra: "#1e40af",
          text: "#f1f5f9",
          muted: "#94a3b8"
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Merriweather", "Georgia", "serif"],
      }
    },
  },
  plugins: [],
};
export default config;
