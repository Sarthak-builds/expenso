/**
 * Vercel Geist design tokens — the single source of design values.
 * No raw hex or magic spacing numbers anywhere else in the codebase.
 * See docs/adr/0005-design-system.md
 *
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Geist runs true black on true white — restraint is the point.
        background: '#ffffff',
        foreground: '#000000',

        // Accents: 1 is the faintest fill, 5 is secondary text.
        accents: {
          1: '#fafafa',
          2: '#eaeaea',
          3: '#999999',
          4: '#888888',
          5: '#666666',
          6: '#444444',
          7: '#333333',
          8: '#111111',
        },

        // One electric blue. Links, focus, the single chart accent.
        blue: { DEFAULT: '#0070f3', dark: '#0761d1' },
        red: { DEFAULT: '#ee0000', dark: '#c50000' },
        amber: { DEFAULT: '#f5a623', dark: '#ab570a' },
        green: { DEFAULT: '#0070f3', dark: '#0761d1' },
        violet: { DEFAULT: '#7928ca', dark: '#4c2889' },
      },
      fontFamily: {
        // PostScript names — 'Geist' alone silently falls back on Android.
        sans: ['Geist_400Regular'],
        medium: ['Geist_500Medium'],
        semibold: ['Geist_600SemiBold'],
        bold: ['Geist_700Bold'],
        mono: ['GeistMono_400Regular'],
        'mono-medium': ['GeistMono_500Medium'],
      },
      fontSize: {
        // Geist type scale. Vary weight and grayscale for hierarchy before
        // reaching for another size.
        'label-12': ['12px', { lineHeight: '16px' }],
        'copy-14': ['14px', { lineHeight: '20px' }],
        'copy-16': ['16px', { lineHeight: '24px' }],
        'heading-24': ['24px', { lineHeight: '32px' }],
        'heading-40': ['40px', { lineHeight: '48px' }],
        'heading-72': ['72px', { lineHeight: '72px' }],
      },
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        6: '24px',
        8: '32px',
        12: '48px',
        16: '64px',
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '8px',
        lg: '12px',
        full: '9999px',
      },
    },
  },
  plugins: [],
};
