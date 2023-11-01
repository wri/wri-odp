import { type Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
        acumin: ['var(--font-acumin)', ...defaultTheme.fontFamily.sans],
      },
      boxShadow: {
        "wri": "0px 4px 4px 0px rgba(147, 147, 147, 0.25)",
      },
      colors: {
        white: "#FFFFFF",
        "wri-gold": "#F3B229",
        "wri-black": "#1A1919",
        "wri-green": "#32864B",
        "wri-gray": "#eae8e4",
        "wri-dark-green": "#2B7340",
        "wri-light-green": "#BAE1BD",
        "wri-light-blue": "#B5D6E8",
        "wri-light-yellow": "#FBE8BE",
        "wri-dark-gray": "#666666",
        "wri-row-gray": "#F9F9F9"
      },
      screens: {
        "4xl": "2048px",
        "3xl": "1920px",
        "xxl": "1440px",
      },
      maxWidth: {
        "8xl": "1350px",
        "9xl": "1440px",
      }
    },
  },
  plugins: [
    require('@tailwindcss/container-queries')
  ],
} satisfies Config;
