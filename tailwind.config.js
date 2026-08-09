const { base, accents, blue, red, amber, violet, teal, pink } = require('./src/lib/theme/palette');

/**
 * Vercel Geist design tokens — the single source of design values.
 * No raw hex or magic spacing numbers anywhere else in the codebase.
 *
 * The hex values themselves live in `src/lib/theme/palette.js`, because chart
 * SVG fills and the native tab bar need them at runtime where a `className`
 * cannot reach. This file maps those primitives onto Tailwind's scale.
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
        // --- Primitive layer -------------------------------------------------
        accents,
        blue,
        red,
        amber,
        violet,
        teal,
        pink,

        // --- Semantic layer --------------------------------------------------
        // React Native Reusables components are written against shadcn's
        // semantic token names. Mapping them onto Geist values here is what
        // makes RNR render as Geist rather than as default shadcn.
        // Never use these names for new app code — prefer the primitives above.
        background: base.white,
        foreground: base.black,
        card: { DEFAULT: base.white, foreground: base.black },
        popover: { DEFAULT: base.white, foreground: base.black },
        // Geist's primary action is a solid black button, not a coloured one.
        primary: { DEFAULT: base.black, foreground: base.white },
        secondary: { DEFAULT: accents[1], foreground: base.black },
        muted: { DEFAULT: accents[1], foreground: accents[5] },
        accent: { DEFAULT: accents[1], foreground: base.black },
        destructive: { DEFAULT: red.DEFAULT, foreground: base.white },
        border: accents[2],
        input: accents[2],
        ring: blue.DEFAULT,
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
