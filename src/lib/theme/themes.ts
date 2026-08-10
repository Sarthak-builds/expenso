import { accents, base, blue, red } from './palette';

/**
 * The three themes.
 *
 * Colours are stored as `R G B` triplet strings rather than hex, because
 * `tailwind.config.js` declares every themed colour as
 * `rgb(var(--color-x) / <alpha-value>)`. That form is what keeps opacity
 * modifiers working — `bg-primary/90` and `border-red/20` are used throughout
 * the React Native Reusables atoms, and a bare `var(--x)` holding a hex string
 * silently breaks all of them.
 *
 * See docs/adr/0012-runtime-themes.md
 */

export const THEME_IDS = ['geist', 'blue', 'pink'] as const;

export type ThemeId = (typeof THEME_IDS)[number];

/**
 * The seed for a theme. Everything else is derived, so adding a theme is seven
 * decisions rather than twenty-eight.
 */
type ThemeSeed = {
  /** The page. */
  background: string;
  /** Faint fill — cards, chart tracks, unselected chips. Maps to accents-1. */
  surface: string;
  /** Hairlines and borders. Maps to accents-2. */
  line: string;
  /** Primary text. */
  foreground: string;
  /** Secondary text and axis labels. Maps to accents-5. */
  muted: string;
  /** The single accent: chart bars, links, focus ring. */
  brand: string;
  /**
   * Solid button fill. Deliberately separate from `brand` — `brand` is tuned
   * for graphic use against the background, and the same value behind white
   * 14px text usually lands under 4.5:1. This one is darkened until it passes.
   */
  primary: string;
  /**
   * Errors and destructive actions.
   *
   * Themed, which is not obvious. Geist red `#ee0000` scrapes 4.53:1 on pure
   * white but drops to 4.29:1 on the blue page and 4.25:1 on the pink one —
   * both below 4.5:1, and error copy is the last place to accept that. The
   * tinted themes use the palette's darker red, which lands at 5.8:1.
   * Measured, not eyeballed.
   */
  danger: string;
  /** Status bar and other native chrome: does the OS need dark or light icons? */
  scheme: 'light' | 'dark';
};

const SEEDS: Record<ThemeId, ThemeSeed> = {
  // Geist proper: true black on true white. Unchanged from ADR 0005.
  geist: {
    background: base.white,
    surface: accents[1],
    line: accents[2],
    foreground: base.black,
    muted: accents[5],
    brand: blue.DEFAULT,
    primary: base.black,
    danger: red.DEFAULT,
    scheme: 'light',
  },

  blue: {
    background: '#f5f9ff',
    surface: '#eaf2fe',
    line: '#dbe8fb',
    foreground: '#0a1a2f',
    muted: '#4a6485',
    brand: '#2b7fff',
    primary: '#0b5ed7',
    danger: red.dark,
    scheme: 'light',
  },

  pink: {
    background: '#fff5f9',
    surface: '#fdeaf2',
    line: '#fbdce8',
    foreground: '#2f0a1a',
    muted: '#854861',
    brand: '#e5478f',
    primary: '#c01f6a',
    danger: red.dark,
    scheme: 'light',
  },
};

/** `#0070f3` -> `"0 112 243"`. */
export function hexToTriplet(hex: string): string {
  const value = hex.replace('#', '');
  const full =
    value.length === 3
      ? value
          .split('')
          .map((char) => char + char)
          .join('')
      : value;
  const int = parseInt(full, 16);
  return `${(int >> 16) & 255} ${(int >> 8) & 255} ${int & 255}`;
}

/**
 * The grayscale rungs that do NOT tint.
 *
 * 3, 4, 6, 7 and 8 are used for chevrons, axis labels and icon strokes — marks
 * that should read as neutral furniture in every theme. Tinting them would
 * make a blue app where even the disclosure arrows are blue, which reads as a
 * colour cast rather than a theme.
 */
const NEUTRAL_ACCENTS = {
  '--color-accents-3': hexToTriplet(accents[3]),
  '--color-accents-4': hexToTriplet(accents[4]),
  '--color-accents-6': hexToTriplet(accents[6]),
  '--color-accents-7': hexToTriplet(accents[7]),
  '--color-accents-8': hexToTriplet(accents[8]),
} as const;

function buildVars(seed: ThemeSeed): Record<string, string> {
  const background = hexToTriplet(seed.background);
  const foreground = hexToTriplet(seed.foreground);
  const surface = hexToTriplet(seed.surface);
  const line = hexToTriplet(seed.line);
  const muted = hexToTriplet(seed.muted);
  const brand = hexToTriplet(seed.brand);
  const primary = hexToTriplet(seed.primary);
  const white = hexToTriplet(base.white);

  return {
    ...NEUTRAL_ACCENTS,

    '--color-background': background,
    '--color-foreground': foreground,

    '--color-accents-1': surface,
    '--color-accents-2': line,
    '--color-accents-5': muted,

    // Cards sit on the page rather than floating above it — Geist separates
    // with a hairline, not elevation, and the tinted themes keep that.
    '--color-card': background,
    '--color-card-foreground': foreground,
    '--color-popover': background,
    '--color-popover-foreground': foreground,

    '--color-primary': primary,
    '--color-primary-foreground': white,
    '--color-secondary': surface,
    '--color-secondary-foreground': foreground,
    '--color-muted': surface,
    '--color-muted-foreground': muted,
    '--color-accent': surface,
    '--color-accent-foreground': foreground,

    '--color-border': line,
    '--color-input': line,
    '--color-ring': brand,
    '--color-brand': brand,
    '--color-danger': hexToTriplet(seed.danger),
    '--color-danger-foreground': white,
  };
}

export const THEME_VARS: Record<ThemeId, Record<string, string>> = {
  geist: buildVars(SEEDS.geist),
  blue: buildVars(SEEDS.blue),
  pink: buildVars(SEEDS.pink),
};

/**
 * Resolved hex for the places a `className` cannot reach — `react-native-svg`
 * fill props and the native tab bar. Same values as the CSS variables above,
 * in the form those APIs accept.
 */
export const THEME_COLORS: Record<
  ThemeId,
  {
    background: string;
    foreground: string;
    border: string;
    subtle: string;
    muted: string;
    accent: string;
    danger: string;
    scheme: 'light' | 'dark';
  }
> = {
  geist: resolve('geist'),
  blue: resolve('blue'),
  pink: resolve('pink'),
};

function resolve(id: ThemeId) {
  const seed = SEEDS[id];
  return {
    background: seed.background,
    foreground: seed.foreground,
    border: seed.line,
    subtle: seed.surface,
    muted: seed.muted,
    accent: seed.brand,
    danger: seed.danger,
    scheme: seed.scheme,
  };
}

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && (THEME_IDS as readonly string[]).includes(value);
}
