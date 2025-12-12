// frontend/tailwind.config.js - MUST BE CORRECT

export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        glinda: {
          light: "#f9f7ff",
          gold: "#f8d77c",
          pink: "#e8b7ff", // ⬅️ Glinda Accent
        },
        elphaba: {
          dark: "#0f1412", // ⬅️ Elphaba Background
          green: "#1f8a4c", // ⬅️ Elphaba Accent
          neon: "#2cff8b",
        },
        // ...
      },
      // ...
    },
  },
  plugins: [],
};