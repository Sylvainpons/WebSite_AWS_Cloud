/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        navy: {
          800: '#0f172a',
          900: '#080f1f',
          950: '#040810',
        },
        ocean: {
          700: '#1e3a5f',
          800: '#162d4a',
          900: '#0d1f35',
        }
      },
      fontFamily: {
        display: ['"Cinzel"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
