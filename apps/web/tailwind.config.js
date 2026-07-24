/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4DA3FF",
          light: "#7BB8FF",
          dark: "#2B7FE6",
        },
        accent: {
          DEFAULT: "#C9A96E",
          gold: "#C9A96E",
        },
        bg: {
          DEFAULT: "#F4F8FF",
          soft: "#EEF4FD",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          glass: "rgba(255,255,255,0.72)",
        },
        text: {
          DEFAULT: "#1E293B",
          muted: "#64748B",
          light: "#94A3B8",
        },
        tag: {
          blue: "#E0F2FE",
          "blue-text": "#0284C7",
          green: "#DCFCE7",
          "green-text": "#16A34A",
          purple: "#EDE9FE",
          "purple-text": "#7C3AED",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Source Han Serif SC"', "SimSun", "serif"],
        sans: ['"PingFang SC"', '"SF Pro Display"', '"Microsoft YaHei"', "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 24px rgba(77, 163, 255, 0.08), 0 1px 3px rgba(0,0,0,0.04)",
        "card-hover": "0 8px 32px rgba(77, 163, 255, 0.14), 0 2px 8px rgba(0,0,0,0.06)",
        nav: "0 -4px 24px rgba(77, 163, 255, 0.1)",
        fab: "0 8px 24px rgba(77, 163, 255, 0.35)",
      },
      backgroundImage: {
        "page-gradient":
          "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(147,197,253,0.35) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 100% 0%, rgba(196,181,253,0.2) 0%, transparent 50%), linear-gradient(180deg, #F4F8FF 0%, #F8FAFF 50%, #F0F4FF 100%)",
        "hero-gradient": "linear-gradient(135deg, #4DA3FF 0%, #7BB8FF 50%, #A5C8FF 100%)",
        "chat-gradient":
          "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(147,197,253,0.25) 0%, transparent 70%), linear-gradient(180deg, #F4F8FF 0%, #FAFCFF 100%)",
      },
      borderRadius: {
        "2.5xl": "1.25rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
