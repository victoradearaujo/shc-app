import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#FFF8E1",
          100: "#FFECB3",
          200: "#FFE082",
          300: "#FFD54F",
          400: "#FFCA28",
          500: "#F39C12",
          600: "#E8920A",
          700: "#D68507",
          800: "#C47705",
          900: "#A86203",
        },
        navy: {
          50: "#E8F0F8",
          100: "#C5D9ED",
          200: "#9FBFE0",
          300: "#78A5D3",
          400: "#5B91C9",
          500: "#1B4F72",
          600: "#174567",
          700: "#133A58",
          800: "#0F2F49",
          900: "#0A2035",
        },
      },
    },
  },
  plugins: [],
};
export default config;
