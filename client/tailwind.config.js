/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F3F5F2',
        ink: '#14282B',
        muted: '#5C6F70',
        line: '#D9E0DC',
        clinic: { DEFAULT: '#1F6F6B', dark: '#174F4C', soft: '#DCEBE8' },
        amber: { DEFAULT: '#B9791A', soft: '#F6E8CC' },
        slate: { DEFAULT: '#3A6EA5', dark: '#244A72', soft: '#DEE8F3' },
        rose: { DEFAULT: '#A8403A', soft: '#F4DEDB' },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        body: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
