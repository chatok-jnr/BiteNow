/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Admin BiteNow Palette - Professional & Modern
        primary: "#E63946",      // Vibrant Red - primary actions, headers
        secondary: "#1D3557",    // Dark Navy - sidebar, dark elements
        tertiary: "#F5F5F5",     // Soft White - cards, panels
        custom_black: "#212529", // Dark Charcoal - text, borders
        
        // Text colors
        textPrimary: "#212529",  // Dark Charcoal - primary text
        
        // Accent colors
        accent: {
          DEFAULT: "#FFB703",    // Golden Yellow - highlights, actions
          light: "#FFD60A",      // Lighter Yellow - hover states
          dark: "#F48C06",       // Darker Yellow - active states
        },
        
        // Background colors
        bgPrimary: "#F5F5F5",    // Soft White - main background
        surface: "#F5F5F5",      // Soft White - section backgrounds
        
        // Semantic colors
        success: "#2A9D8F",      // Green - success states
        warning: "#F59E0B",      // Amber - warnings
        error: "#E63946",        // Vibrant Red - errors
        info: "#457B9D",         // Blue - information
      },
    },
  },
  plugins: [],
};
