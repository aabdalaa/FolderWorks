/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        teams: {
          50: '#f5f6fc',
          100: '#ebeef9',
          200: '#d7dcf3',
          300: '#b4beea',
          400: '#8a99de',
          500: '#6270d1',
          600: '#5b5fc7', // Teams Signature Blurple
          700: '#4f52b2',
          800: '#42459b',
          900: '#383b7f',
          950: '#242654',
        },
        slate: {
          950: '#030712',
          900: '#0b0f19',
          850: '#111827',
          800: '#1f2937',
        }
      }
    },
  },
  plugins: [],
}
