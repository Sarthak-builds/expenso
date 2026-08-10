# Architecture Decision Records

Each ADR captures one decision, why it was made, and what it costs. Format is
[MADR](https://adr.github.io/madr/)-lite: **Context → Decision → Consequences**.

Write a new ADR when a decision would otherwise have to be reverse-engineered
from the code — especially when the obvious choice was rejected. Supersede
rather than edit: keep the original and mark it `Superseded by ADR-XXXX`.

| # | Decision | Status |
|---|---|---|
| [0001](0001-local-first-storage.md) | Local-first storage with MMKV, no backend | Accepted |
| [0002](0002-state-management.md) | Repository + Zustand revision; React Query for Gemini only | Accepted |
| [0003](0003-expense-data-model.md) | Integer minor units and local day-key dates | Accepted |
| [0004](0004-credentials-and-secrets.md) | Device lock, not authentication | Accepted |
| [0005](0005-design-system.md) | NativeWind v4 + React Native Reusables + cva | Accepted |
| [0006](0006-navigation.md) | expo-router with native tabs | Accepted |
| [0007](0007-gemini-integration.md) | Structured output with a pre-aggregated spend digest | Accepted |
| [0008](0008-charts.md) | Hand-rolled react-native-svg charts | Accepted |
| [0009](0009-package-manager-pnpm.md) | pnpm with `node-linker=hoisted` | Accepted |
| [0010](0010-branching-and-commits.md) | staging trunk, feature branches, ~300-line commits | Accepted |
| [0011](0011-component-layers-and-schema-ui.md) | Atomic component layers; forms declared as data | Accepted |
| [0012](0012-runtime-themes.md) | Runtime themes via CSS variables (Geist / blue / pink) | Accepted |
