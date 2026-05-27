/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('nativewind/preset')],
  content: [
    './App.tsx',
    './index.ts',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#f8f3ea',
        surface: '#fffdf9',
        'surface-muted': '#faefe2',
        'surface-container-low': '#fff9f0',
        'surface-container-highest': '#eadfcc',
        'outline-variant': '#dbcab4',
        'text-charcoal': '#2a1f18',
        primary: '#8b5a00',
        'primary-soft': '#f6e7ce',
        'primary-container': '#f3d9ad',
        'saffron-light': '#d89b1d',
        'on-primary-fixed': '#ffffff',
      },
      fontFamily: {
        display: ['Georgia', 'Times New Roman', 'serif'],
      },
    },
  },
  plugins: [],
};