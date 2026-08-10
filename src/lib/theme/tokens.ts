import { accents, amber, blue, pink, teal, violet } from './palette';

/**
 * Runtime design tokens that do NOT depend on the active theme.
 *
 * Theme-dependent colours moved to `useThemeColors()` — a static `colors`
 * export used to live here, and it was a trap once themes existed: a chart
 * importing it would keep painting Geist blue on the pink theme, with nothing
 * to indicate why. If you need a themed colour at runtime, use the hook.
 */

/**
 * Categorical series colours, in assignment order.
 *
 * Geist's chart language is minimal by definition — the daily-spend bars use
 * `accent` alone. This ramp exists only for the category breakdown, where the
 * segments must be told apart. Order is fixed so a category keeps its colour
 * between renders; callers map their own domain ids onto an index.
 */
export const series = [
  blue.DEFAULT,
  violet.DEFAULT,
  teal.DEFAULT,
  amber.DEFAULT,
  pink.DEFAULT,
  blue.dark,
  violet.dark,
  accents[4],
] as const;

/** Picks a stable series colour for a position, wrapping past the end. */
export function seriesColor(index: number): string {
  return series[((index % series.length) + series.length) % series.length]!;
}

/**
 * Corner radii in points. Mirrors `borderRadius` in `tailwind.config.js` for
 * SVG and `borderCurve` call sites, which take numbers rather than classes.
 */
export const radius = {
  sm: 6,
  md: 8,
  lg: 12,
  full: 9999,
  /** Bar caps. Geist keeps these nearly square — see docs/adr/0008-charts.md */
  bar: 2,
} as const;

/**
 * Motion. Short and non-negotiable: this is a data app, and an animation the
 * user has to wait for is a bug. Durations are in milliseconds.
 *
 * `fast` is for press feedback, `base` for enter/exit, `slow` only for the
 * value transitions on the dashboard where the eye needs to follow a number.
 */
export const motion = {
  fast: 120,
  base: 200,
  slow: 320,
  /** Per-item delay when a list staggers in. Kept tiny — 12 rows is 84ms. */
  stagger: 28,
  /** Cap on staggered items; beyond this everything enters together. */
  staggerLimit: 8,
} as const;
