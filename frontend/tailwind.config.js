/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F7F8FA',
        surface: '#FFFFFF',
        'surface-subtle': '#FAFAFB',
        'surface-hover': '#F3F4F6',
        'border-subtle': '#F0F0F2',
        'border-default': '#E5E7EB',
        'border-strong': '#D1D5DB',
        content: {
          primary: '#171717',
          secondary: '#737373',
          muted: '#A3A3A3',
        },
        status: {
          up: '#10B981',
          'up-bg': '#ECFDF5',
          'up-text': '#047857',
          'up-border': '#A7F3D0',
          down: '#EF4444',
          'down-bg': '#FEF2F2',
          'down-text': '#B91C1C',
          'down-border': '#FECACA',
          open: '#F59E0B',
          'open-bg': '#FFFBEB',
          'open-text': '#B45309',
          'open-border': '#FDE68A',
          resolved: '#3B82F6',
          'resolved-bg': '#EFF6FF',
          'resolved-text': '#1D4ED8',
          'resolved-border': '#BFDBFE',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.03), 0 1px 2px -1px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 6px 16px -2px rgba(0, 0, 0, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'dropdown': '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.15s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(3px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
