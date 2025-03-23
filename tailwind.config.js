/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        maroon: {
          DEFAULT: '#8B0000',
          '50': '#FF9999',
          '100': '#FF8080',
          '200': '#FF4D4D',
          '300': '#FF1A1A',
          '400': '#E60000',
          '500': '#8B0000',
          '600': '#720000',
          '700': '#590000',
          '800': '#400000',
          '900': '#270000',
          '950': '#1A0000',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in forwards',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(10px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
      },
    },
  },
  plugins: [],
}; 