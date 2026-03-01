/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        surface: {
          DEFAULT: '#111111',
          elevated: '#1a1a1a',
        },
        border: {
          DEFAULT: '#262626',
          hover: '#333333',
        },
        accent: {
          DEFAULT: '#dc2626',
          hover: '#ef4444',
          orange: '#f97316',
        },
        muted: '#525252',
        success: '#22c55e',
        gray: {
          950: '#0a0a0a',
          900: '#111111',
          800: '#1a1a1a',
          700: '#262626',
          600: '#333333',
          500: '#525252',
          400: '#737373',
          300: '#a3a3a3',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
