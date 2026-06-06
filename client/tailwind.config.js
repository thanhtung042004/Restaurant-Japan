/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#070503',
          2: '#0e0a06',
          3: '#150f08',
        },
        gold: {
          DEFAULT: '#c9a447',
          light: '#e8c87a',
          dim: 'rgba(201, 164, 71, 0.6)',
          glow: 'rgba(201, 164, 71, 0.15)',
        },
        wine: {
          DEFAULT: '#5c1515',
          light: '#8b2020',
        },
        wood: {
          DEFAULT: '#2a1a08',
          light: '#3d2510',
        },
        cream: {
          DEFAULT: '#f2e8d5',
          dim: '#b8a888',
        },
        muted: '#7a6040',
        glass: {
          bg: 'rgba(255, 255, 255, 0.03)',
          hover: 'rgba(255, 255, 255, 0.06)',
          border: 'rgba(201, 164, 71, 0.18)',
          'border-hover': 'rgba(201, 164, 71, 0.4)',
        }
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        jp: ['Noto Serif JP', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'preloaderPulse 1.8s ease-in-out infinite',
        'fade-up': 'fadeUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(to bottom, rgba(7, 5, 3, 0.2) 0%, rgba(7, 5, 3, 0.1) 30%, rgba(7, 5, 3, 0.3) 60%, rgba(7, 5, 3, 0.85) 100%)',
        'side-gradient': 'linear-gradient(to right, rgba(7, 5, 3, 0.5) 0%, transparent 30%, transparent 70%, rgba(7, 5, 3, 0.5) 100%)',
      }
    },
  },
  plugins: [],
}
