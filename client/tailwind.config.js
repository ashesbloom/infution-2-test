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
          secondary: "#3a3436", // Charcoal (Navbar / Footer)
          accent: "#f0fdfc",    // Mint (Light Background)
          bg: "#f0fdfc",        // Mint (Page Background)
          text: "#3a3436",      // Charcoal (Body Text)
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