# 0006 — expo-router with native tabs

**Status:** Accepted · 2026-08-07

## Context

The app has five screens: Login, Dashboard, Add Expense, Chat, Settings. Four
sit behind a bottom tab bar; Login gates all of them.

`vercel-react-native-skills` is unambiguous that native navigators must be used
rather than JS-drawn ones, and that native header options
(`headerLargeTitleEnabled`, `headerSearchBarOptions`) are preferred over custom
header components.

## Decision

`expo-router` with file-based routing, and `expo-router/unstable-native-tabs`
for the bottom bar.

```
app/
  _layout.tsx           providers + auth gate
  (auth)/login.tsx
  (tabs)/_layout.tsx    NativeTabs — 4 triggers
  (tabs)/index.tsx      Dashboard
  (tabs)/add.tsx  chat.tsx  settings.tsx
```

Route files stay thin (≤20 lines) and delegate to
`features/<x>/screens/<Screen>`. This keeps routing structure separate from
feature implementation, so a screen can move without touching its route.

## Consequences

**Good.** Native transitions and gestures for free. Tab bar is the real platform
control, so it inherits system behaviour (blur, safe area, accessibility).
Typed routes via `experiments.typedRoutes`.

**Costs and traps.**

- `main` must become `expo-router/entry`, and `App.tsx` / `index.ts` must be
  **deleted**. Leaving `registerRootComponent` alongside the router entry
  double-registers the root and yields a blank screen with no error message.
- `scheme` is required in app config. Without it, deep links and the dev
  client's `expenso://` launch both break.
- The auth gate must **not** call `router.replace()` from `_layout.tsx` before
  the navigator has mounted — that throws. Use `<Stack.Protected guard={...}>`
  or conditionally render the auth group.
- On iOS, native tabs apply `contentInsetAdjustmentBehavior` to the *first
  ScrollView at the root of each tab screen*. A `FlashList` wrapped in a padded
  `View` loses this and renders under the translucent tab bar. The list must be
  the root element, with padding in `contentContainerStyle`.
- Tab count is capped at 4 here; `ui-ux-pro-max` advises ≤5.
