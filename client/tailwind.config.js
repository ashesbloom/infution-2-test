/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#06a34f",   // Green (Buttons / Highlights)
          secondary: "#3a3436", // Charcoal (Text / Headers)
          accent: "#f0fdfc",    // Mint (Accent areas)
          bg: "#ffffff",        // White (Page Background)
          surface: "#f8fafc",   // Slate-50 (Cards / Sections)
          muted: "#f1f5f9",     // Slate-100 (Muted backgrounds)
          text: "#1e293b",      // Slate-800 (Body Text)
          textLight: "#64748b", // Slate-500 (Secondary text)
          border: "#e2e8f0",    // Slate-200 (Borders)
          danger: "#EF4444",    // Red (Error / Out of Stock)
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}