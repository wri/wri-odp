import { type Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
        acumin: ['"Acumin Pro"', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        white: "#FFFFFF",
        "wri-gold": "#F3B229",
        "wri-black": "#1A1919",
        "wri-green": "#32864B",
        "wri-gray": "#eae8e4"
      },
      screens: {
        "4xl": "2048px",
        "3xl": "1920px",
      }
    },
  },
  plugins: [],
} satisfies Config;
