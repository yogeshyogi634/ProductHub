/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        orange-500: '#de5b11',
        neogray: '#7f7f7f',
      },
      fontFamily: {
        sans: ['Inter', 'Tahoma', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
