/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Foxhole Primary Palette
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#7367f0', // Electric Purple - Main
          600: '#6355d8',
          700: '#5243c0',
          800: '#4132a8',
          900: '#302490',
        },
        // Background colors
        surface: {
          50: '#FFFFFF',
          100: '#F8F7FA', // Soft White - Main background
          200: '#F3F2F5',
          300: '#EEEDF0',
          400: '#E8E7EB',
        },
        // Status colors
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#28c76f',
          600: '#22b863',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#ff9f43',
          600: '#f59e0b',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ea5455',
          600: '#dc2626',
        },
        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#00cfe8',
          600: '#0284c7',
        },
        // Text colors
        text: {
          primary: '#2F3349',
          secondary: '#6e6b7b',
          muted: '#a8a5b3',
          light: '#d0d2d6',
        }
      },
      fontFamily: {
        sans: ['Public Sans', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 24px 0 rgba(34, 41, 47, 0.1)',
        'card-hover': '0 8px 32px 0 rgba(34, 41, 47, 0.15)',
        'dropdown': '0 5px 25px rgba(34, 41, 47, 0.1)',
      },
      borderRadius: {
        'card': '0.75rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-out': 'slideOut 0.3s ease-in',
        'scale-up': 'scaleUp 0.2s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideOut: {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        scaleUp: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
