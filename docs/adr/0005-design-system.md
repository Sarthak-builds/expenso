# 0005 — NativeWind v4 + React Native Reusables + cva

**Status:** Accepted · 2026-08-07

## Context

The app is themed to Vercel's Geist design system. The requirement is that
`components/ui/` holds atoms, each exposing variants built with `cva`
(class-variance-authority) and a `cn` helper, sourced from **React Native
Reusables** (RNR) — the shadcn/ui port for React Native.

RNR is built on **NativeWind**, so adopting it means adopting Tailwind-in-RN.
That replaces an earlier plan to use `StyleSheet` with a frozen token object.

None of the installed agent skills contain Geist's actual values — they had to
be sourced from Vercel directly.

### Version selection

| Package | Chosen | Why |
|---|---|---|
| `nativewind` | **4.2.6** (`latest`) | Stable. Published 2026-06-22 — *newer* than v5-preview.4 (2026-05-15). |
| `tailwindcss` | **v3** | Required by NativeWind v4 (`peer: >3.3.0`). |
| `@react-native-reusables/cli` | **0.7.1** | Latest published (2026-03-14). |

NativeWind **v5 was rejected**: it is explicitly labelled "not intended for
production use", it needs Tailwind v4 plus `react-native-css@3`, and its most
recent preview predates the current stable v4 release. RNR 0.7.1 also predates
v5's ecosystem, so v4 is the coherent pairing.

## Decision

- NativeWind v4 + Tailwind v3, with Geist tokens defined in
  `tailwind.config.js` as the single source of design values.
- `components/ui/` holds atoms added via the RNR CLI, each with `cva` variants
  and the `cn` (clsx + tailwind-merge) helper.
- Geist tokens: `#000`/`#fff` base; accents `#fafafa`, `#eaeaea`, `#666666`;
  blue `#0070f3`; red `#ee0000`; amber `#f5a623`. Type scale 72/40/24/16(lh24)/
  14(lh20)/12(lh16). Spacing on a 4px base: 4/8/12/16/24/32/48/64. Radius
  6/8/12/9999.
- Typeface is Geist Sans + Geist Mono via `@expo-google-fonts/geist`, loaded
  through the `expo-font` **config plugin** (build-time embedding, no splash
  hold) rather than `useFonts()`.

## Consequences

**Good.** Variants are declarative and colocated with each atom. Geist values
live in exactly one file. RNR gives accessible, well-tested primitives instead
of hand-rolled ones.

**Compatibility risk — resolved.** RNR 0.7.1 (March 2026) predates Expo SDK 57
and RN 0.86 (June 2026), and NativeWind v4 depends on
`react-native-css-interop@0.2.6`, whose behaviour on RN 0.86's new architecture
was unverified when this was written.

Verified 2026-08-07 with a full Android Metro bundle (`expo export`): **1,575
modules bundled successfully** with React Compiler enabled, and the compiled
output contains both the Geist PostScript names (`Geist_400Regular`,
`Geist_600SemiBold`, `Geist_700Bold`) and the `#0070f3` token — confirming
`tailwind.config.js` is consumed end-to-end. The v5-preview fallback is not
needed.

Re-run `pnpm expo export --platform android` after any NativeWind, Tailwind or
RN version bump; this pairing is not covered by anyone else's CI.

**Also.** NativeWind pulls in `react-native-reanimated` as a peer, reversing an
earlier decision not to install it. It is now a required dependency, not an
optional one.

**Font trap.** `fontFamily` must be the PostScript name (`Geist_400Regular`),
not `'Geist'`. `fontFamily: 'Geist'` with `fontWeight: '700'` silently falls
back to the system font on Android — prebuild succeeds and nothing errors.
