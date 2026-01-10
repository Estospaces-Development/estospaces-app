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
        primary: {
          DEFAULT: '#FF6B35',
          light: '#FF8C61',
          dark: '#E55A2B',
        },
      },
      fontFamily: {
        // Default: Inter for user dashboard
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'sans-serif'],
        // Manager dashboard: Arial/Helvetica
        manager: ['Arial', 'Helvetica', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'sans-serif'],
        serif: ['Cormorant Garamond', 'serif'],
      },
      fontSize: {
        // User dashboard typography (chat interface scale)
        'xs': ['12px', { lineHeight: '1.5', letterSpacing: '-0.008em', fontWeight: '400' }],
        'sm': ['14px', { lineHeight: '1.5', letterSpacing: '-0.011em', fontWeight: '400' }],
        'base': ['14px', { lineHeight: '1.5', letterSpacing: '-0.011em', fontWeight: '400' }],
        'lg': ['16px', { lineHeight: '1.5', letterSpacing: '-0.012em', fontWeight: '400' }],
        'xl': ['18px', { lineHeight: '1.45', letterSpacing: '-0.015em', fontWeight: '600' }],
        '2xl': ['20px', { lineHeight: '1.4', letterSpacing: '-0.018em', fontWeight: '600' }],
        '3xl': ['24px', { lineHeight: '1.35', letterSpacing: '-0.02em', fontWeight: '600' }],
        '4xl': ['28px', { lineHeight: '1.3', letterSpacing: '-0.022em', fontWeight: '600' }],
        // Label and caption sizes
        'label': ['12px', { lineHeight: '1.5', letterSpacing: '-0.008em', fontWeight: '500' }],
        'caption': ['11px', { lineHeight: '1.4', letterSpacing: '-0.006em', fontWeight: '400' }],
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
    },
  },
  plugins: [],
}
