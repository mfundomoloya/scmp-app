// tailwind.config.js
//import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        blue: '#0055b8', // Primary blue for buttons, links, etc.
        'blue-dark': '#003d82', // Darker blue for hover states
        'blue-light': '#e6f0ff', // Light blue for backgrounds
        black: '#212121', // Almost black for text
        'gray-dark': '#555555', // Dark gray for secondary text
        'gray-light': '#f5f8fa',
        // Semantic colors
        success: '#2e7d32', // Green
        danger: '#d32f2f', // Red
        // Keep the original colors for backward compatibility
        purple: '#3f3cbb',
        midnight: '#121063',
        metal: '#565584',
        tahiti: '#3ab7bf',
        silver: '#ecebff',
        'bubble-gum': '#ff77e9',
        bermuda: '#78dcca',
        homepage: '#463f3a',
        footer: '#343a40',
      },
    },
  },
  plugins: [],
};
