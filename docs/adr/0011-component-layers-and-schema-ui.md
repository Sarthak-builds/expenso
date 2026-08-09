# 0011 — Atomic layers, and forms described as data

**Status:** Accepted · 2026-08-08

## Context

ADR 0005 fixed the styling system and put atoms in `components/ui/`. It did not
say what sits between an atom and a screen, and it did not say how a screen
composes one. Two questions came up as soon as real screens existed:

1. `components/ui/` holds an `Input` and a `Button`. A dashboard needs a KPI
   tile, a list row and a segmented control. None of those are atoms, none of
   them are domain-aware, and CLAUDE.md's placement rule ("does it import from
   `features/*`?") says only where they *cannot* go.

2. The app has three forms — Login, Add expense, Settings. Built by hand they
   share nothing: three label placements, three error treatments, three
   opinions about which keyboard a phone field gets. That drift is not
   hypothetical; it is what happens to every codebase with three forms.

## Decision

### Layers

Atomic design, with CLAUDE.md's domain-freedom rule as the *other* axis:

| Layer | Location | Rule |
|---|---|---|
| Atoms | `components/ui/` | RNR primitives, `cva` variants |
| Molecules | `components/molecules/` | Compose atoms. One job each. Domain-free |
| Organisms | `components/organisms/`, `components/charts/` | Compose molecules. Still domain-free |
| Domain organisms | `features/<x>/components/` | May import the feature's model |
| Templates | `features/<x>/screens/` | Whole screens |
| Pages | `app/` | Routing only, ≤20 lines |

The two axes are independent: `charts/BarChart` is an organism *and* domain-free;
`expenses/components/SpendTrendChart` is the same organism with a domain
mapping in front of it. `charts/` keeps its own top-level folder because ADR
0008 named that path.

### Forms are data

`components/organisms/schema-form/` renders a `UiSchema` — an array of
discriminated-union nodes. Login, Add expense and Settings each declare one in
their feature's `schema/` folder.

Two constraints keep it a renderer rather than a framework:

- **Every value is a string.** Form state is `Record<string, string>` — exactly
  what JSON gives you. Parsing to paise or a `DayKey` happens at the feature
  boundary on submit.
- **No domain types in a node.** A node knows `options` and `rules`, never
  `CategoryId`. That is what lets the package live in `components/`.

The registry is a mapped type over the node union, so adding a node kind
without a renderer is a compile error.

## Consequences

**Good.** Keyboard configuration, label placement, error styling and validation
exist once. A phone field gets `number-pad`, a 10-digit cap and telephone
autofill because it is a `phone` node, not because someone remembered. Settings
is a schema-producing function, so its rows stay declarative despite depending
on runtime state.

**Bad — and this is the real cost.** Anything the node union cannot express has
to be added to the union, which is a worse experience than writing the markup
directly would have been. This pays off at three forms; at one it would have
been indulgent. **If a screen needs a control that exists nowhere else, build it
directly and leave the schema alone.** The renderer is for what repeats.

**Two control choices were made inside it, both narrower than they look:**

- **Category is a chip grid, not a dropdown.** Eight options, in a flow the user
  repeats several times a day. A dropdown is three interactions; chips are one.
  This stops being right somewhere past a dozen options.
- **Date is a strip of the last seven days, not a calendar.**
  `@react-native-community/datetimepicker` is a native module, so it forces a
  rebuild, and a modal picker is three taps for an answer that is "today"
  almost every time. **The trade-off is real: back-dating beyond a week is not
  possible.** If that starts to matter, `DayField` is the one component to
  change — the schema node stays as it is.

**Rejected: a form library.** React Hook Form and Formik solve re-render
scoping on large forms. The largest form here has five fields, all of which fit
in one `useState`, and neither library would have addressed the actual problem,
which was three screens disagreeing about what a label looks like.
