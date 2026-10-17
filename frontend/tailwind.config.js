/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        black: '#000000',
        brand: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        },
        slate: {
          950: '#000000', // Pure pitch black canvas
          900: '#0a0a0a', // Dark obsidian card background
          850: '#121214', // Slightly elevated surface
          800: '#1c1c1f', // Sleek card border
          700: '#27272a', // Inner border / divider
          600: '#3f3f46',
          500: '#71717a',
          400: '#a1a1aa', // Secondary text
          300: '#d4d4d8', // Primary body text
          200: '#e4e4e7',
          100: '#f4f4f5', // Headings / crisp white
          50: '#ffffff',
        }
      },
    },
  },
  plugins: [],
}
