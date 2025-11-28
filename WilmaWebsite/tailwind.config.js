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
          DEFAULT: "#5851ea",
          50: "#f5f4ff",
          100: "#ebe9ff",
          200: "#d4cfff",
          300: "#b9b0ff",
          400: "#9d93ff",
          500: "#5851ea",
          600: "#4641d9",
          700: "#3a31b8",
          800: "#2a2491",
          900: "#1d1969",
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
        elevated: "0 20px 45px -20px rgba(88,81,234,0.35)",
      },
    },
  },
  plugins: [],
};
