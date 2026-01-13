/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ff6b81',
        secondary: '#74b9ff',
        accent: '#a29bfe'
      },
      fontFamily: {
        'round': ['"PingFang SC"', '"Microsoft YaHei"', 'sans-serif']
      }
    },
  },
  plugins: [],
}
