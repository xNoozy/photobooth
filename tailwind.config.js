/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        burgundy: '#4A0E1F',
        cream: '#F8F1E9',
        champagne: '#D9B66F',
        gold: '#C79A34',
        softblack: '#151113',
        blush: '#F4D7D7'
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Cinzel', 'Georgia', 'serif'],
        body: ['Inter', 'Satoshi', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        luxe: '0 24px 80px rgba(74, 14, 31, 0.28)'
      }
    }
  },
  plugins: []
};
