/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        lightText: '#000000',  // Default light mode text color (black)
        darkText: '#ffffff',   // Default dark mode text color (white)
      },
    },
  },
  darkMode: 'class', // Enables class-based dark mode
  plugins: [],
};
