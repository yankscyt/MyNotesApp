// frontend/tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  // ⬅️ ADD THIS LINE to enable class-based dark mode
  darkMode: 'class', 
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}