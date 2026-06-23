import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        secondary: '#22C55E',
        danger: '#EF4444',
        warning: '#F59E0B',
        ink: '#0F172A',
        mist: '#F8FAFC',
      },
      boxShadow: {
        soft: '0 20px 50px rgba(15, 23, 42, 0.08)',
        glow: '0 0 0 1px rgba(37, 99, 235, 0.18), 0 24px 60px rgba(37, 99, 235, 0.16)',
      },
      borderRadius: {
        xl: '20px',
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(circle at top left, rgba(37,99,235,0.24), transparent 34%), radial-gradient(circle at top right, rgba(34,197,94,0.18), transparent 28%), linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
} satisfies Config
