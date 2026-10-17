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
          50: '#f0f5ff',
          100: '#e0ecff',
          200: '#c5dcfe',
          300: '#9bc4fc',
          400: '#69a4f8',
          500: '#3d80f3',
          600: '#2662e5',
          700: '#1d4dc8',
          800: '#1b40a1',
          900: '#1b387e',
          950: '#11224f',
        },
        slate: {
          850: '#172033',
          900: '#0f172a',
          950: '#090d16',
        }
      },
    },
  },
  plugins: [],
}
