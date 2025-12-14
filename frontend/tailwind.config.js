/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#8a122c",
        secondary: "#289c40",
      },
    },
  },
  plugins: [],
};
