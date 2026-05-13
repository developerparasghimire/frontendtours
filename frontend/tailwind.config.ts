import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core brand
        "brand-navy": "#1D2521",
        "brand-red": "#E21301",
        "brand-green": "#2F8E07",
        "brand-orange": "#EE8721",
        "brand-blue": "#339AAC",
        "brand-brown": "#491510",
        // Semantic tokens
        primary: "#E21301",
        "primary-light": "#FF6B47",
        secondary: "#339AAC",
        accent: "#2F8E07",
        dark: "#1D2521",
        blue: "#339AAC",
        green: "#2F8E07",
      },
    },
  },
  plugins: [],
};

export default config;
