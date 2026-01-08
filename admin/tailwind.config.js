/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#000000ff",
        secondary: "#EAE4D5",
        tertiary: "#B6B09F",
        custom_black: "#000000",
      },
    },
  },
  plugins: [],
};
