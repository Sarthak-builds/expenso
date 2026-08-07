# 0009 — pnpm with `node-linker=hoisted`

**Status:** Accepted · 2026-08-07

## Context

The project was scaffolded with npm. pnpm was chosen for speed and disk
efficiency.

pnpm's default layout is a content-addressable store with symlinks — each
package sees only its declared dependencies. This is pnpm's main correctness
feature, and it is **incompatible with React Native autolinking**.

Autolinking resolves native module paths on disk from Gradle and CocoaPods,
outside Node's resolution algorithm. Those build systems do not follow pnpm's
symlink structure, so native modules fail to link. With MMKV (a Nitro module),
`react-native-svg`, `react-native-screens` and `react-native-reanimated` all in
play, this would break the build immediately.

## Decision

Use pnpm, with `.npmrc`:

```
node-linker=hoisted
strict-peer-dependencies=false
```

`node-linker=hoisted` produces an npm-style flat `node_modules`, keeping
autolinking working while retaining pnpm's fast, deduplicated global store.

`strict-peer-dependencies=false` because Expo and RN packages routinely declare
loose or missing peer ranges; strict mode blocks installs over warnings that are
not actionable.

Commands: `pnpm add`, `pnpm expo install` (never `npm install` / `npx expo
install`). `package-lock.json` is deleted; `pnpm-lock.yaml` is the lockfile.

## Consequences

**Good.** Fast installs, one global content-addressable store across projects,
and a lockfile that is far easier to read in review than `package-lock.json`.

**Bad.** `node-linker=hoisted` gives up pnpm's strict dependency isolation — a
package can import something it never declared, exactly as with npm. That is the
price of native builds working, and it is not optional.

**Trap.** If `.npmrc` is ever deleted or the store is reinstalled without it,
builds fail with confusing "module not found" errors at native link time rather
than at install time. The file carries a comment saying so.

**Scripts.** Environment variants are driven by `APP_VARIANT`, read in
`app.config.ts`:

- `pnpm start:staging` → `APP_VARIANT=staging`
- `pnpm start:main` → `APP_VARIANT=production`

`cross-env` is used because Windows shells do not support inline `VAR=value`
prefixes. Note that `.env.staging` is **not** auto-loaded by Expo — dotenv
resolution keys off `NODE_ENV`, which has no `staging` value. `APP_VARIANT` is
the explicit mechanism instead.
