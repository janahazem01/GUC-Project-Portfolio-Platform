/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          base:     "#0D0F14",
          surface:  "#161A23",
          elevated: "#1E2430",
        },
        accent: {
          gold: "#C8A96E",
          blue: "#4A8FD4",
        },
        text: {
          primary:   "#F0EDE6",
          secondary: "#8B8F9A",
        },
        border: "#252B38",
        success: "#4CAF7A",
        danger:  "#E05C5C",
        warning: "#E09A3A",
      },
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        sans:    ["'DM Sans'", "sans-serif"],
        mono:    ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
