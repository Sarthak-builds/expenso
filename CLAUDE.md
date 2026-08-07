@AGENTS.md

# Expenso

Frontend-only daily expense tracker. Expenses are key→value pairs (`Milk` → ₹30)
with a category and a day. All data is local in MMKV — **there is no backend**.
A Gemini chatbot adds expenses from natural language and answers questions about
spending. Themed to Vercel's Geist design system.

Architecture decisions live in `docs/adr/`. **Read the relevant ADR before
changing anything it covers**, and add a new ADR when you make a decision that
future work would otherwise have to reverse-engineer.

---

## Toolchain

- **pnpm only.** Never `npm install` / `npx expo install` — use `pnpm add` /
  `pnpm expo install`. A stray `package-lock.json` is a bug; delete it.
- `.npmrc` sets `node-linker=hoisted`. **Do not remove it** — RN autolinking
  cannot follow pnpm's symlinked layout and builds will fail at link time.
- **Never run `expo run:android` / `expo run:ios`.** Builds are the user's call.
  Use `pnpm start:staging` / `pnpm start:main`.
- Expo Go does not work here (MMKV Nitro + native tabs + font plugin). A dev
  build is required.

## Architecture

Feature-based, with a domain-free component library beneath it.

```
app/                 expo-router routes ONLY, <=20 lines each
src/features/        auth, expenses, chat, settings
src/components/ui/   atoms — domain-free, cva variants
src/lib/             theme, strings, storage, ai, format, env, query
docs/adr/            architecture decision records
```

**Dependency direction is one-way and enforced:**

```
app/ → features/* → lib/*
            ↘ components/* ↗
features/chat → features/expenses     (allowed, ONE-WAY)
auth, expenses, settings → no cross-feature imports
```

- Cross-feature imports go through `features/<x>/index.ts`.
- Intra-feature imports are relative and must **not** route through the
  feature's own barrel — that is how require-cycles start.
- **Where does a component go?** It belongs in `components/ui/` only if it
  renders with **zero imports from `src/features/*`** and **no domain type in
  its props**. If it needs `Expense`, `CategoryId` or `ChatMessage`, it lives in
  that feature. `BarChart({ points })` is global; `SpendTrendChart({ range })`
  is not.

## Rules

**Text** — every user-facing string comes from `src/lib/strings`. A string
literal rendered in a component is a bug. This is the single source of truth.

**Styling** — NativeWind classes via `cva` variants and the `cn` helper. No
inline `StyleSheet` for anything a variant can express, no raw hex, no magic
spacing numbers. Geist tokens live in `tailwind.config.js`.

**State** — MMKV is ground truth. Zustand holds UI state plus a `revision`
counter; derive everything else during render. **React Query is for Gemini calls
only** — never wrap synchronous MMKV reads in `useQuery` (see ADR 0002).

**Money** — integer `amountMinor` (paise) everywhere. Never floats. Divide by
100 only at the `Intl` formatting edge.

**Dates** — `YYYY-MM-DD` local-date strings, never timestamps (see ADR 0003).

**React Native** (from `vercel-react-native-skills`, authoritative here):
- Virtualize every list — `FlashList`, never `ScrollView` + `.map()`.
- Pair every `borderRadius` with `borderCurve: 'continuous'`.
- `gap` on the parent, not margins on children. Padding inside, gap between.
- CSS string shadows (`boxShadow: '0 2px 8px rgba(0,0,0,0.1)'`), not
  `shadowOffset`/`elevation`.
- Vary `fontWeight` and grayscale for hierarchy rather than adding font sizes.
- `Pressable`, not `TouchableOpacity`.
- Fonts via the `expo-font` config plugin, not `useFonts()`.
- Touch targets ≥44×44pt. No emoji as icons.

## Workflow

- Work on `staging`. Cut `feat/<name>` branches off `staging` for each sizable
  feature, merge back into `staging`. `main` is a release checkpoint only.
- **Commit and push roughly every 300 lines of code.** Small, working commits.
- `pnpm typecheck` must be clean before every commit — there is no test suite,
  so this is the only guard.
- **Never commit `.env`.** The repo is public. `EXPO_PUBLIC_*` values are
  inlined into the bundle and are not secrets (ADR 0004).
- Editing `.env` does not hot-reload; restart with `--clear`.

## Skills

- **Use:** `vercel-react-native-skills` and `ui-ux-pro-max` — native-scoped and
  authoritative for this codebase. `vercel-composition-patterns` for component
  API design.
- **Ignore:** `ui-styling` and `web-design-guidelines` — shadcn/Radix/DOM
  guidance that does not apply to React Native.
- **Cherry-pick only** `rerender-*` and `js-*` rules from
  `vercel-react-best-practices`; the rest is Next.js/RSC/bundler-specific.
