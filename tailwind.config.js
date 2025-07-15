/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/renderer/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        peach: '#FCEFEF',
        sky: '#DCEEFF', 
        cream: '#FFF7D6',
        mint: '#E5FDD1',
        lavender: '#F3E8FF',
        rose: '#FFE4E6',
        coral: {
          50: '#fef7f6',
          100: '#fdeeed',
          200: '#fad5d2',
          300: '#f7bcb7',
          400: '#f18a82',
          500: '#eb594d',
          600: '#d44f44',
          700: '#b14239',
          800: '#8f352e',
          900: '#752b25',
        },
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-soft': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-soft': 'bounce 1s infinite',
      }
    },
  },
  plugins: [],
}