/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Main brand colors
        primary: "#67A177",      // Main green - buttons, accents
        secondary: "#8DBC96",    // Medium green - navbar, footer
        tertiary: "#ACD4B1",     // Light green - cards background
        
        // Background colors
        bgPrimary: "#C4E2C4",    // Lightest green - page background
        surface: "#DDEEDB",      // Very light green - sections
        
        // Accent colors
        accent: {
          DEFAULT: "#5a8f68",    // Darker green - hover states
          light: "#DDEEDB",      // Light green - hover text
        },
      },
    },
  },
  plugins: [],
};
