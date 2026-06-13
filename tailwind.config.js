/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Calming slate/navy tones
        navy: {
          50: '#f4f6fa',
          100: '#e8edf5',
          200: '#ccd8eb',
          300: '#9fb6db',
          400: '#6c8ec8',
          500: '#476fb3',
          600: '#355696',
          700: '#2c467c',
          800: '#273c68',
          900: '#233457',
          950: '#0d1527', // Dark background base
        },
        // Serene healing green
        serene: {
          50: '#f0fdf6',
          100: '#dbfde8',
          200: '#b7fad2',
          300: '#7ef5ad',
          400: '#3ee680',
          500: '#15cc60',
          600: '#0baf4d',
          700: '#0b8a3f',
          800: '#0e6d35',
          900: '#0d592e',
          950: '#043217',
        }
      },
      animation: {
        'breath-in-out': 'breath 16s ease-in-out infinite',
        'fade-float': 'fadeFloat 4s ease-out forwards',
      },
      keyframes: {
        breath: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '25%': { transform: 'scale(1.4)', opacity: '1' }, // Inhale for 4s (25% of 16s)
          '50%': { transform: 'scale(1.4)', opacity: '1' }, // Hold for 4s (50% of 16s)
          '75%': { transform: 'scale(0.95)', opacity: '0.6' }, // Exhale for 4s (75% of 16s)
        },
        fadeFloat: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '1', filter: 'blur(0)' },
          '50%': { transform: 'translateY(-100px) scale(0.9)', opacity: '0.7', filter: 'blur(1px)' },
          '100%': { transform: 'translateY(-250px) scale(0.5)', opacity: '0', filter: 'blur(4px)' }
        }
      }
    },
  },
  plugins: [],
}
