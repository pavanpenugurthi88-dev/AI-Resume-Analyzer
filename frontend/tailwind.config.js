/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        card: 'var(--color-card)',
        primary: {
          DEFAULT: 'var(--color-primary)',
          blue: 'var(--color-primary)',
          cyan: 'var(--color-accent)',
          purple: 'var(--color-secondary)',
        },
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-danger)',
        info: 'var(--color-accent)',
        text: 'var(--color-text)',
        textSecondary: 'var(--color-text-secondary)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '32px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(to bottom, #ffffff 0%, #f4f4f5 100%)',
        'hero-gradient-dark': 'linear-gradient(to bottom, #1c1c1e 0%, #000000 100%)',
        'card-gradient': 'linear-gradient(to bottom, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.5) 100%)',
        'card-gradient-dark': 'linear-gradient(to bottom, rgba(28,28,30,0.7) 0%, rgba(28,28,30,0.5) 100%)',
        'score-gradient': 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
      },
      animation: {
        'float': 'float 8s cubic-bezier(0.2, 0.8, 0.2, 1) infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
        'slide-in-right': 'slideInRight 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
        'glow': 'glow 3s ease-in-out infinite alternate',
        'spin-slow': 'spin 12s linear infinite',
        'score-fill': 'scoreFill 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(30px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        glow: {
          from: { boxShadow: '0 0 20px rgba(14, 165, 233, 0.2)' },
          to: { boxShadow: '0 0 40px rgba(14, 165, 233, 0.4)' },
        },
        scoreFill: {
          from: { strokeDashoffset: '339.29' },
          to: { strokeDashoffset: 'var(--score-offset)' },
        },
      },
      backdropBlur: {
        xs: '2px',
        md: '12px',
        xl: '24px',
        '2xl': '40px',
      },
      boxShadow: {
        'glow-primary': '0 0 24px rgba(14,165,233,0.15)',
        'glow-accent': '0 0 24px rgba(255,255,255,0.4)',
        'glow-success': '0 0 24px rgba(52, 199, 89, 0.15)',
        'card': '0 8px 32px 0 rgba(0, 0, 0, 0.05), inset 0 1px 0 0 rgba(255,255,255,0.6)',
        'card-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255,255,255,0.1)',
        'card-hover': '0 12px 48px 0 rgba(0, 0, 0, 0.08), inset 0 1px 0 0 rgba(255,255,255,0.8)',
        'card-hover-dark': '0 12px 48px 0 rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255,255,255,0.2)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
