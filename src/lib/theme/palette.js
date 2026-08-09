/**
 * Vercel Geist primitives — the ONE place a hex value is written.
 *
 * CommonJS on purpose. `tailwind.config.js` is loaded by Node at build time and
 * cannot import TypeScript, while chart SVG fills and the native tab bar tint
 * need the same values at runtime where a `className` cannot reach. A plain
 * `.js` module is the only format both sides can consume, so it is the source
 * and `tailwind.config.js` is a consumer.
 *
 * Types live alongside in `palette.d.ts`. See docs/adr/0005-design-system.md
 */

/** Geist runs true black on true white — restraint is the point. */
const base = {
  black: '#000000',
  white: '#ffffff',
};

/** 1 is the faintest fill, 5 is secondary text, 8 is near-black. */
const accents = {
  1: '#fafafa',
  2: '#eaeaea',
  3: '#999999',
  4: '#888888',
  5: '#666666',
  6: '#444444',
  7: '#333333',
  8: '#111111',
};

/** One electric blue: links, focus, and the single chart accent. */
const blue = { DEFAULT: '#0070f3', dark: '#0761d1' };
const red = { DEFAULT: '#ee0000', dark: '#c50000' };
const amber = { DEFAULT: '#f5a623', dark: '#ab570a' };
const violet = { DEFAULT: '#7928ca', dark: '#4c2889' };
const teal = { DEFAULT: '#50e3c2', dark: '#29bc9b' };
const pink = { DEFAULT: '#ff0080', dark: '#d80060' };

module.exports = { base, accents, blue, red, amber, violet, teal, pink };
