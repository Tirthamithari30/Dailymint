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
        background: '#060A12',
        surface: '#0B1120',
        'surface-card': '#111A2E',
        'surface-elevated': '#16223B',
        'surface-border': '#1E2F52',
        primary: {
          DEFAULT: '#00FF87',
          hover: '#05F191',
          dim: 'rgba(0, 255, 135, 0.15)',
          glow: 'rgba(0, 255, 135, 0.4)',
        },
        accent: {
          blue: '#38BDF8',
          purple: '#A855F7',
          amber: '#FBBF24',
          danger: '#EF4444',
          dangerDim: 'rgba(239, 68, 68, 0.15)',
        },
        navy: {
          950: '#04070D',
          900: '#0A0F1D',
          850: '#0E1628',
          800: '#141E34',
          700: '#1F2E50',
          600: '#2D3F68',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'neon': '0 0 25px rgba(0, 255, 135, 0.35)',
        'neon-strong': '0 0 40px rgba(0, 255, 135, 0.65)',
        'neon-danger': '0 0 30px rgba(239, 68, 68, 0.45)',
        'neon-amber': '0 0 30px rgba(251, 191, 36, 0.45)',
        'card-glow': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { filter: 'drop-shadow(0 0 15px rgba(0, 255, 135, 0.4))' },
          '50%': { filter: 'drop-shadow(0 0 25px rgba(0, 255, 135, 0.8))' },
        }
      }
    },
  },
  plugins: [],
}
