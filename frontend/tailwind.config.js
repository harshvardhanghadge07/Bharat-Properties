/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#faf2ed',
          100: '#f3e3d7',
          200: '#e4c7b4',
          300: '#d1a487',
          400: '#be805c',
          500: '#a34e2f',
          600: '#8b4027',
          700: '#733521',
        },
        gold: '#C9A96E',
        dark: '#1c1917',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease forwards',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(30px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
}
