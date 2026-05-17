/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['SF Mono', 'ui-monospace', 'monospace'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1)',
        'scale-in': 'scaleIn 0.5s cubic-bezier(0.2, 0.9, 0.4, 1.1)',
        'slide-in': 'slideIn 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1)',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      colors: {
        background: '#ffffff',
        foreground: '#111111',
        muted: '#f8f8f8',
        'muted-foreground': '#6b7280',
        border: '#eaeaea',
        'kb-pink': '#FF69B4',
        'kb-pink-dark': '#D41B6C',
        'kb-gold': '#D4AF37',
        'kb-gold-light': '#E9D48B',
        'kb-black': '#0a0a0a',
        'kb-gray': '#f5f5f5',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      boxShadow: {
        'elegant': '0 10px 30px -10px rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
        'elegant-hover': '0 20px 40px -15px rgba(0, 0, 0, 0.1), 0 5px 10px -5px rgba(0, 0, 0, 0.02)',
        'glass': '0 4px 30px rgba(0, 0, 0, 0.05)',
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
    },
  },
  plugins: [],
}