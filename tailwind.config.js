const { amber, violet, teal, pink } = require('./src/lib/theme/palette');

/**
 * A colour that follows the active theme.
 *
 * `<alpha-value>` is substituted by Tailwind with whatever opacity modifier the
 * class carries, which is why the variables hold `R G B` triplets rather than
 * hex — see `src/lib/theme/themes.ts`.
 */
const themed = (name) => `rgb(var(--color-${name}) / <alpha-value>)`;

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
        // --- Themed ----------------------------------------------------------
        // Resolved at runtime from CSS variables so the app can switch between
        // Geist / Light Blue / Light Pink without a reload.
        //
        // The `rgb(var(--x) / <alpha-value>)` form is load-bearing: it is what
        // keeps opacity modifiers working. `bg-primary/90`, `border-red/20` and
        // `shadow-black/5` appear throughout the RNR atoms, and a bare
        // `var(--x)` holding a hex string breaks every one of them silently.
        // See docs/adr/0012-runtime-themes.md
        accents: {
          1: themed('accents-1'),
          2: themed('accents-2'),
          3: themed('accents-3'),
          4: themed('accents-4'),
          5: themed('accents-5'),
          6: themed('accents-6'),
          7: themed('accents-7'),
          8: themed('accents-8'),
        },

        // The single accent — chart bars, links, focus ring. Named `blue` for
        // continuity with the Geist scale, but it is pink under the pink theme.
        blue: themed('brand'),
        red: themed('danger'),

        // --- Static ----------------------------------------------------------
        // The categorical chart ramp does NOT theme. These encode data, not
        // chrome: a category has to keep the same colour when the theme
        // changes, or the legend stops meaning anything across a screenshot.
        amber,
        violet,
        teal,
        pink,

        // --- Semantic layer --------------------------------------------------
        // React Native Reusables components are written against shadcn's
        // semantic token names. Mapping them onto Geist values here is what
        // makes RNR render as Geist rather than as default shadcn.
        // Never use these names for new app code — prefer the primitives above.
        background: themed('background'),
        foreground: themed('foreground'),
        card: { DEFAULT: themed('card'), foreground: themed('card-foreground') },
        popover: { DEFAULT: themed('popover'), foreground: themed('popover-foreground') },
        // Geist's primary action is a solid black button; the tinted themes
        // make it their brand colour, darkened until white text passes 4.5:1.
        primary: { DEFAULT: themed('primary'), foreground: themed('primary-foreground') },
        secondary: { DEFAULT: themed('secondary'), foreground: themed('secondary-foreground') },
        muted: { DEFAULT: themed('muted'), foreground: themed('muted-foreground') },
        accent: { DEFAULT: themed('accent'), foreground: themed('accent-foreground') },
        destructive: { DEFAULT: themed('danger'), foreground: themed('danger-foreground') },
        border: themed('border'),
        input: themed('input'),
        ring: themed('ring'),
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
