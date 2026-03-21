import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: "#101014",
        slate: "#1C1F26",
        accent: "#FF7A18",
        accentMuted: "#FFE3D0",
      },
    },
  },
  plugins: [],
};

export default config;
