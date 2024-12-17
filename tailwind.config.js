/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "background": "#111111",
        "text": "#eeeeee",
        "primary": "#0e0e0e",
        "secondary": "#191919"
      },
      fontFamily: {
        "outfit": ["Outfit", "sans-serif"],
        "optima": ["Optima", "sans-serif"]
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out'
      }
    },
  },
  plugins: [],
}

