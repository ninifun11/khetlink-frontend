/** KhetLink design tokens
 *  neel      – indigo (from the natural indigo dye long grown in Telangana): primary, structure
 *  turmeric  – accent: prices, highlights, primary calls to action on marketing pages
 *  paddy     – growth / success
 *  chilli    – alerts / destructive
 *
 *  Redesign notes: the brand anchors (neel-700, turmeric-400, paddy-500, chilli-500, ink) are unchanged so
 *  hard-coded chart and map colours stay in step. Neutrals are softer, radii rounder, and there is a small
 *  elevation + motion scale (shadow-card / shadow-lift / shadow-pop, animate-*).
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}', './lib/**/*.js'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#1B2340', soft: '#5A6480', muted: '#6B7491' },
        line: { DEFAULT: '#E3E8F1', strong: '#CBD3E3' },
        field: '#F5F7FB',
        neel: { 50: '#EEF1FA', 100: '#DCE3F5', 200: '#B9C7EB', 300: '#8FA4DC', 400: '#6480CB', 500: '#4260B5', 600: '#33499A', 700: '#2A3B7D', 800: '#222F63', 900: '#1B254F', 950: '#121A3C' },
        turmeric: { 50: '#FFF8E1', 100: '#FFEFB8', 200: '#FFE082', 300: '#FFD24D', 400: '#F5B921', 500: '#E3A008', 600: '#B97F04', 700: '#8F6104' },
        paddy: { 50: '#EFF7EC', 100: '#D9EDD3', 200: '#B4DBA9', 300: '#8CC77E', 500: '#4C9A3F', 600: '#3B7E30', 700: '#2E6326' },
        chilli: { 50: '#FDF0EE', 100: '#FADDD8', 200: '#F3B8AF', 300: '#EA9488', 500: '#D64533', 600: '#B8362A', 700: '#93291F' },
      },
      fontFamily: {
        display: ['var(--font-display)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: { md: '10px', lg: '14px', xl: '18px', '2xl': '24px' },
      boxShadow: {
        card: '0 1px 2px rgba(27, 35, 64, 0.04), 0 1px 3px rgba(27, 35, 64, 0.05)',
        lift: '0 10px 28px -8px rgba(27, 35, 64, 0.16), 0 2px 6px rgba(27, 35, 64, 0.06)',
        pop: '0 24px 56px -12px rgba(27, 35, 64, 0.35)',
      },
      // Keyframes live in globals.css (so CSS classes and utilities can share them); fill-mode is "backwards"
      // on purpose: a lingering transform would turn the animated element into the containing block for
      // position:fixed children (e.g. the listing modal).
      animation: {
        'fade-in': 'fade-in 0.25s ease-out backwards',
        'fade-up': 'fade-up 0.45s cubic-bezier(0.2, 0.7, 0.2, 1) backwards',
        'scale-in': 'scale-in 0.22s cubic-bezier(0.2, 0.7, 0.2, 1) backwards',
        'grow-x': 'grow-x 0.9s cubic-bezier(0.2, 0.7, 0.2, 1) backwards',
        float: 'float 6s ease-in-out infinite',
        pop: 'pop 0.35s ease-out',
      },
    },
  },
  plugins: [],
};
