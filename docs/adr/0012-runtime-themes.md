# 0012 — Runtime themes via CSS variables

**Status:** Accepted · 2026-08-08 · Extends [ADR 0005](0005-design-system.md)

## Context

ADR 0005 committed the app to Geist: true black on true white, one electric
blue accent, values written once in `tailwind.config.js`. Two more themes were
requested — light blue and light pink — tinting surfaces as well as the accent,
with Geist kept as the default.

Static hex in the Tailwind config cannot express that. The colour has to be
decided at render, not at build.

## Decision

**CSS variables, applied at the root by NativeWind's `vars()`.**

```
palette.js          literal hex, unchanged — still the only place a hex is written
themes.ts           three seeds -> ~24 CSS variables each, as "R G B" triplets
tailwind.config.js  themed colours become rgb(var(--color-x) / <alpha-value>)
theme-context.tsx   ThemeProvider applies vars(); useThemeColors() for SVG
```

A theme is defined by an **eight-value seed** — background, surface, line,
foreground, muted, brand, primary, danger — and everything else is derived.
Adding a theme is eight decisions, not twenty-eight.

### Triplets, not hex

The variables hold `"0 112 243"`, not `"#0070f3"`, and the config wraps them as
`rgb(var(--color-x) / <alpha-value>)`.

This is the load-bearing detail. React Native Reusables leans on opacity
modifiers throughout — `bg-primary/90`, `active:bg-destructive/90`,
`border-red/20`. A bare `var(--x)` holding a hex compiles, renders, and breaks
**every one of them silently**: the colour is right and the opacity is ignored.
Verified by generating the CSS: `bg-primary/90` emits
`rgb(var(--color-primary) / 0.9)`.

### What does *not* theme

**The categorical chart ramp stays fixed.** `series` in `tokens.ts` encodes
data, not chrome — if groceries were blue in one theme and pink in another, a
legend would stop meaning anything across a screenshot or between two people
comparing screens. Only the single accent (bars, links, focus ring) follows the
theme.

**Accents 3, 4, 6, 7 and 8 stay neutral gray.** They are chevrons, axis labels
and icon strokes. Tinting them produces an app where even the disclosure arrows
are blue, which reads as a colour cast rather than a theme.

### Danger is themed, which is not obvious

Geist red `#ee0000` measures 4.53:1 on pure white — a pass, barely. On the blue
page it is 4.29:1 and on the pink page 4.25:1. Both fail AA, and error copy is
the last place to accept that. The tinted themes use the palette's darker red
at ~5.8:1.

All three themes were measured, not eyeballed:

| | body | muted text | white on primary | brand | danger |
|---|---|---|---|---|---|
| Geist | 21.0 | 5.74 | 21.0 | 4.55 | 4.53 |
| Blue | 16.5 | 5.76 | 5.84 | 3.56 | 5.89 |
| Pink | 16.7 | 6.36 | 5.76 | 3.50 | 5.83 |

Text targets 4.5:1; `brand` is graphic use (bars, rings) and targets 3:1.

`primary` is deliberately a separate seed value from `brand`. The accent tuned
for bars against a page is usually too light behind white 14px text — `brand`
blue `#2b7fff` is 3.56:1, so `primary` is `#0b5ed7` at 5.84:1.

## Consequences

**Good.** Switching is one re-render — no reload, no restart. Every existing
`bg-background` / `text-foreground` / `border-accents-2` class themed itself
with no component changes, including inside the vendored RNR atoms.

**Bad.** The static `colors` export in `tokens.ts` had to be **deleted**, not
deprecated. A chart importing it would have kept painting Geist blue on the
pink theme with nothing to indicate why. Anything needing a themed colour at
runtime now goes through `useThemeColors()`, and that is only legitimate for
`react-native-svg` fills and the native tab bar — two places in the app.

**Trap.** `ThemeProvider` renders a `View` to carry the variables. Without
`flex-1` on it the whole app collapses to zero height and renders blank, with
no error.

**Cost.** Colours are no longer greppable. `text-blue` resolves to pink under
the pink theme; the name is kept for continuity with the Geist scale, and it is
misleading. Renaming it to `text-brand` across the codebase is the honest fix
and is worth doing if the themes stay.
