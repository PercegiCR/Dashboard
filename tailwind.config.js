/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-dark': '#0f172a',
        'bg-darker': '#020617',
        'panel-bg': 'rgba(30, 41, 59, 0.7)',
        'panel-border': 'rgba(255, 255, 255, 0.1)',
        'accent-gold': '#d97706',
        'accent-gold-hover': '#b45309',
        'success': '#10b981',
        'danger': '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
