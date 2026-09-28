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
          50: 'rgb(var(--color-teams-50-rgb, 245 246 252) / <alpha-value>)',
          100: 'rgb(var(--color-teams-100-rgb, 235 238 249) / <alpha-value>)',
          200: 'rgb(var(--color-teams-200-rgb, 215 220 243) / <alpha-value>)',
          300: 'rgb(var(--color-teams-300-rgb, 180 190 234) / <alpha-value>)',
          400: 'rgb(var(--color-teams-400-rgb, 138 153 222) / <alpha-value>)',
          500: 'rgb(var(--color-teams-500-rgb, 98 112 209) / <alpha-value>)',
          600: 'rgb(var(--color-teams-600-rgb, 91 95 199) / <alpha-value>)',
          700: 'rgb(var(--color-teams-700-rgb, 79 82 178) / <alpha-value>)',
          800: 'rgb(var(--color-teams-800-rgb, 66 69 155) / <alpha-value>)',
          900: 'rgb(var(--color-teams-900-rgb, 56 59 127) / <alpha-value>)',
          950: 'rgb(var(--color-teams-950-rgb, 36 38 84) / <alpha-value>)',
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
