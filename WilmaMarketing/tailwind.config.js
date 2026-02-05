/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/content/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#4169e1",
          50: "#f0f4ff",
          100: "#e1e9ff",
          200: "#c8d7ff",
          300: "#a2bcff",
          400: "#7698fe",
          500: "#4169e1",
          600: "#3251cd",
          700: "#2a41ab",
          800: "#25378b",
          900: "#213071",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        elevated: "0 20px 45px -20px rgba(65,105,225,0.35)",
      },
    },
  },
  plugins: [],
};
