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
          primary: "#FFD700",   // Gold (Buttons / Highlights)
          secondary: "#000000", // Black (Navbar / Footer)
          accent: "#FFFFFF",    // White (Text)
          bg: "#F3F4F6",        // Light Gray (Page Background)
          text: "#1F2937",      // Dark Gray (Body Text)
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