import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ocean: "#0B3954",
        spray: "#BFD7EA",
        foam: "#F6F9FC",
        sand: "#E0A458",
        coral: "#D1495B"
      }
    }
  },
  plugins: []
};

export default config;
