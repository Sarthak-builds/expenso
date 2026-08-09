/**
 * Types for `palette.js`. Shapes are declared here; the VALUES live in the
 * `.js` file and are never repeated. Adding a hex literal to this file defeats
 * the point of the split.
 */

type Duo = { readonly DEFAULT: string; readonly dark: string };

export declare const base: { readonly black: string; readonly white: string };

export declare const accents: {
  readonly 1: string;
  readonly 2: string;
  readonly 3: string;
  readonly 4: string;
  readonly 5: string;
  readonly 6: string;
  readonly 7: string;
  readonly 8: string;
};

export declare const blue: Duo;
export declare const red: Duo;
export declare const amber: Duo;
export declare const violet: Duo;
export declare const teal: Duo;
export declare const pink: Duo;
