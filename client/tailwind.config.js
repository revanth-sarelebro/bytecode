/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F8F5F0',
        ink: '#3B2A1A',
        muted: '#75675A',
        line: '#E6DDCF',
        clinic: { DEFAULT: '#A5650F', dark: '#4A3522', soft: '#FBE9C8' },
        amber: { DEFAULT: '#7A5200', soft: '#FCEFC9' },
        slate: { DEFAULT: '#2F6B5E', dark: '#1F4A41', soft: '#DCEBE6' },
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
