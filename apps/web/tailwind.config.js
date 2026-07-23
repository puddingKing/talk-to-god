/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#5c4d7a",
          light: "#7b6b99",
        },
        accent: "#c9a96e",
        bg: "#faf8f5",
        surface: "#ffffff",
        text: {
          DEFAULT: "#2c2c2c",
          muted: "#6b6b6b",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Source Han Serif SC"', "SimSun", "serif"],
        sans: ['"PingFang SC"', '"Microsoft YaHei"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
