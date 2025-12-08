/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'ueb-blue': '#1A2B46', // Azul Institucional
        'ueb-yellow': '#FFA000', // Amarillo Botones
      }
    },
  },
  plugins: [],
}