/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Main brand colors - BiteNow Color Palette
        primary: "#E63946",      // Vibrant Red - buttons, CTA, brand accent
        secondary: "#1D3557",    // Dark Navy - navbar, footer, trust elements
        tertiary: "#F5F5F5",     // Soft White - card backgrounds, panels
        
        // Background colors
        bgPrimary: "#F5F5F5",    // Soft White - page background
        surface: "#F5F5F5",      // Soft White - section backgrounds
        
        // Text colors
        textPrimary: "#212529",  // Dark Charcoal - primary text
        
        // Accent colors
        accent: {
          DEFAULT: "#FFB703",    // Golden Yellow - CTA buttons, highlights
          light: "#FFD60A",      // Lighter Yellow - hover states
          dark: "#F48C06",       // Darker Yellow - active states
        },
        
        // Semantic colors
        success: "#2A9D8F",      // Green - order confirmed, success messages
        warning: "#F59E0B",      // Amber - warnings
        error: "#E63946",        // Vibrant Red - errors
        info: "#457B9D",         // Blue - information
      },
    },
  },
  plugins: [],
};
