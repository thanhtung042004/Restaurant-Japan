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
          4: '#1a1209',
        },
        gold: {
          DEFAULT: '#c9a447',
          light: '#e8c87a',
          dim: 'rgba(201, 164, 71, 0.6)',
          glow: 'rgba(201, 164, 71, 0.15)',
          subtle: 'rgba(201, 164, 71, 0.08)',
        },
        wine: {
          DEFAULT: '#5c1515',
          light: '#8b2020',
          bright: '#b02828',
        },
        wood: {
          DEFAULT: '#2a1a08',
          light: '#3d2510',
          mid: '#4a2e12',
        },
        cream: {
          DEFAULT: '#f2e8d5',
          dim: '#b8a888',
          soft: '#d4c5a9',
        },
        muted: '#7a6040',
        amber: {
          warm: '#d4830a',
          soft: '#e8a020',
        },
        glass: {
          bg: 'rgba(255, 255, 255, 0.03)',
          hover: 'rgba(255, 255, 255, 0.06)',
          border: 'rgba(201, 164, 71, 0.18)',
          'border-hover': 'rgba(201, 164, 71, 0.4)',
        },
        status: {
          available: '#22c55e',
          occupied: '#ef4444',
          reserved: '#c9a447',
          clearing: '#b8a888',
          pending: '#f59e0b',
          cooking: '#3b82f6',
          ready: '#22c55e',
          done: '#6b7280',
        }
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        jp: ['Noto Serif JP', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'preloaderPulse 1.8s ease-in-out infinite',
        'fade-up': 'fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-right': 'slideRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'glow-pulse': 'glowPulse 2.5s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'bounce-slow': 'bounceSlow 2s ease-in-out infinite',
        'card-lift': 'cardLift 0.3s ease-out forwards',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'ripple': 'ripple 1.5s ease-out infinite',
        'typing': 'typing 1.2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(201, 164, 71, 0.2)' },
          '50%': { boxShadow: '0 0 25px rgba(201, 164, 71, 0.5)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        bounceSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        cardLift: {
          '0%': { transform: 'translateY(0) scale(1)' },
          '100%': { transform: 'translateY(-4px) scale(1.01)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        ripple: {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
        typing: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      boxShadow: {
        'gold': '0 0 20px rgba(201, 164, 71, 0.2)',
        'gold-lg': '0 0 40px rgba(201, 164, 71, 0.3)',
        'gold-inner': 'inset 0 0 20px rgba(201, 164, 71, 0.08)',
        'luxury': '0 8px 32px rgba(0,0,0,0.6), 0 1px 0 rgba(201, 164, 71, 0.1)',
        'luxury-lg': '0 20px 60px rgba(0,0,0,0.8), 0 1px 0 rgba(201, 164, 71, 0.15)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'wine': '0 0 20px rgba(139, 32, 32, 0.3)',
        'green': '0 0 15px rgba(34, 197, 94, 0.3)',
        'inset-gold': 'inset 0 1px 0 rgba(201, 164, 71, 0.1)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(to bottom, rgba(7, 5, 3, 0.2) 0%, rgba(7, 5, 3, 0.1) 30%, rgba(7, 5, 3, 0.3) 60%, rgba(7, 5, 3, 0.85) 100%)',
        'side-gradient': 'linear-gradient(to right, rgba(7, 5, 3, 0.5) 0%, transparent 30%, transparent 70%, rgba(7, 5, 3, 0.5) 100%)',
        'gold-gradient': 'linear-gradient(135deg, #c9a447 0%, #e8c87a 50%, #c9a447 100%)',
        'dark-gradient': 'linear-gradient(180deg, #0e0a06 0%, #070503 100%)',
        'card-gradient': 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
        'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(201,164,71,0.08) 50%, transparent 100%)',
      },
      borderRadius: {
        'xl2': '1.25rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      backdropBlur: {
        'xs': '2px',
      },
      transitionTimingFunction: {
        'luxury': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
