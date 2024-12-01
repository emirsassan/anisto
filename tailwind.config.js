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
        "outfit": ["Outfit", "sans-serif"]
      }
    },
  },
  plugins: [],
}

