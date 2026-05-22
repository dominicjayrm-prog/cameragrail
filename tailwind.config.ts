import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0E1A2B',
        navy2: '#16263D',
        blue: {
          DEFAULT: '#2D6CDF',
          soft: '#5B8DEF',
        },
        paper: '#F7F9FC',
        ink: '#0E1A2B',
        slate: '#5A6B82',
        line: '#E4EAF2',
        success: '#1F8A55',
        down: '#C24536',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        head: ['var(--font-spline)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '14px',
        pill: '100px',
      },
      boxShadow: {
        soft: '0 6px 26px -14px rgba(14,26,43,0.2)',
        lift: '0 18px 40px -22px rgba(14,26,43,0.4)',
      },
      maxWidth: {
        page: '1240px',
      },
      keyframes: {
        rise: {
          from: { opacity: '0', transform: 'translateY(22px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        rise: 'rise .85s cubic-bezier(0.16,1,0.3,1) both',
      },
    },
  },
  plugins: [],
};

export default config;
