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
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc7fb',
          400: '#36abf7',
          500: '#0c8fe9',
          600: '#0171c8',
          700: '#025aa2',
          800: '#064c85',
          900: '#0b406f',
          950: '#072849',
        },
        india: {
          saffron: '#FF9933',
          emerald: '#138808',
          navy: '#000080',
          ashoka: '#0A2540'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'soft-lg': '0 10px 30px -4px rgba(0, 0, 0, 0.08)',
        'glow': '0 0 25px rgba(12, 143, 233, 0.25)',
      }
    },
  },
  plugins: [],
}
