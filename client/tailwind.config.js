/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ocean: {
          950: '#040914',
          900: '#081225',
          850: '#0c1a33',
          800: '#112344',
          700: '#19335f',
          600: '#23477e',
          500: '#2e5fa3',
          400: '#4880cb',
          300: '#72a4e4',
          200: '#a7caf4',
          100: '#dbeafe',
        },
        marine: {
          cyan: '#06b6d4',
          teal: '#14b8a6',
          aqua: '#22d3ee',
          deep: '#0369a1',
        },
        risk: {
          low: '#10b981',
          moderate: '#f59e0b',
          high: '#ef4444',
          critical: '#dc2626'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
