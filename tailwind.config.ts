import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './index.tsx',
    './App.tsx',
    './components/**/*.{ts,tsx}',
    './context/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './content/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'warm-beige':  '#FDFBF7',
        'cappuccino':  '#D2B48C',
        'deep-brown':  '#3D352F',
        'accent-gold': '#A68A64',
        'paper-white': '#F5F1EA',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans:  ['Inter', 'sans-serif'],
      },
      keyframes: {
        zoom: {
          '0%':   { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1.15)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
