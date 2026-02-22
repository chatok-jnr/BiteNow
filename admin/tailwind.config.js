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
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 20px -2px rgba(0, 0, 0, 0.1), 0 10px 30px -3px rgba(0, 0, 0, 0.08)',
        'large': '0 10px 40px -5px rgba(0, 0, 0, 0.15), 0 20px 50px -10px rgba(0, 0, 0, 0.1)',
        'xl-red': '0 20px 60px -15px rgba(230, 57, 70, 0.4)',
        'xl-yellow': '0 20px 60px -15px rgba(255, 183, 3, 0.4)',
        'glow-red': '0 0 20px rgba(230, 57, 70, 0.3), 0 0 40px rgba(230, 57, 70, 0.1)',
        'glow-yellow': '0 0 20px rgba(255, 183, 3, 0.3), 0 0 40px rgba(255, 183, 3, 0.1)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #E63946 0%, #FF6B6B 100%)',
        'gradient-accent': 'linear-gradient(135deg, #FFB703 0%, #FFD60A 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #1D3557 0%, #457B9D 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [],
};
