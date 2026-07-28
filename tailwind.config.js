/**
 * @type {import('tailwindcss').Config}
 *
 * NOTA: Este archivo NO se usa con Tailwind v4 + @tailwindcss/vite.
 * Los tokens de diseño están en src/index.css (@theme) y src/lib/theme.js.
 * Se mantiene por compatibilidad con herramientas que lo referencian.
 */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        mono: ['SF Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        background: '#FDFAF9',
        foreground: '#1A1118',
        muted: '#FDF0F3',
        'muted-foreground': '#7A6B72',
        border: 'rgba(212, 120, 138, 0.15)',
        'kb-mauve-light': '#9A7480',
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
