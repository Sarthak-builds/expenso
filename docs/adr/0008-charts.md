# 0008 — Hand-rolled react-native-svg charts

**Status:** Accepted · 2026-08-07

## Context

The dashboard needs three visuals: daily-spend bars over the selected window, a
category breakdown, and KPI sparklines. Maximum data density is 180 static bars.

## Decision

`react-native-svg` with hand-written chart components. Two of the three visuals
need no SVG at all:

| Visual | Implementation | Size |
|---|---|---|
| Daily spend bars | `<Svg>` with N `<Rect>` | ~70 lines |
| Category breakdown | Plain `<View>`s with flex-basis percentages | no SVG |
| KPI sparkline | One `<Path>`, sharing the bar chart's path builder | ~25 lines |

Placement follows the component rule in `CLAUDE.md`: `components/charts/BarChart`
takes `{ points: {x,y}[] }` and is domain-free;
`features/expenses/components/SpendTrendChart` maps domain data to points.

## Consequences

**Good.** Roughly 150 lines total, entirely token-driven, with zero override
surface. Geist's chart language is minimal *by definition* — no gridlines, no
chart junk, `#0070f3` against grayscale, Geist Mono `label-12` axis labels,
`borderRadius: 2` bar caps. There is nothing to fight.

**Bad.** No tooltips, no pan/zoom, no animation out of the box. If the dashboard
later needs interactive exploration, this decision should be revisited rather
than extended.

**Rejected: victory-native.** Requires `@shopify/react-native-skia` **plus**
`react-native-reanimated` **plus** `react-native-worklets` **plus**
`react-native-gesture-handler` — four native modules and a mandatory rebuild for
two charts. Its strengths (100+ FPS at thousands of points, gesture tooltips)
are irrelevant at ≤180 static bars, and matching Geist would mean overriding its
axis and grid styling anyway.

**Rejected: react-native-gifted-charts.** The opposite failure — an opinionated
batteries-included look (rounded 3D bars, gradients, built-in tooltips, its own
type scale) requiring ~40 prop overrides per chart to reach Geist. It also
renders horizontally scrolling bars as unvirtualized `View`s inside a
`ScrollView`, which directly violates the virtualize-everything rule.

A charting library's value lives in the parts of its spec you actually use. Here
that fraction is small enough that the dependency is a net cost.

**Naming trap.** `react-native-svg` exports a `Text` component that collides
with the design-system `Text`. Import it as `Text as SvgText`, inside chart
files only, and never re-export it from `components/`.
