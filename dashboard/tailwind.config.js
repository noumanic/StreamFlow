/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'kafka-purple': '#6C5CE7',
        'kafka-blue': '#0984E3',
        'kafka-dark': '#1e2029',
      },
    },
  },
  plugins: [],
}
