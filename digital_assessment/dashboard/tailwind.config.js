/** @type {import('tailwindcss').Config} */
export default {
  content: {
    files: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
  },
  theme: {
    extend: {
      colors: {
        primary: '#1565c0',
        secondary: '#7b1fa2',
        success: '#28a745',
        warning: '#ffc107',
        error: '#dc3545',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Inter Tight', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
    },
  },
}

