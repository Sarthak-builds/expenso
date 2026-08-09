/**
 * Shared geometry for the chart components.
 *
 * Domain-free: a chart takes `{ x, y }` points and knows nothing about money,
 * days or categories. Mapping expenses onto points is the feature's job. See
 * docs/adr/0008-charts.md
 */

export type Point = { x: number; y: number };

export type Bounds = { width: number; height: number };

/** Largest `y` in the series, floored at 1 so an all-zero series still scales. */
export function maxY(points: readonly Point[]): number {
  let max = 0;
  for (const point of points) {
    if (point.y > max) max = point.y;
  }
  return max > 0 ? max : 1;
}

/**
 * Scales a series into pixel space, y-flipped (SVG's origin is top-left).
 *
 * `x` is treated as an index rather than a value — the series is always evenly
 * spaced days, so honouring irregular x-values would cost a division per point
 * for a case that cannot occur here.
 */
export function scalePoints(points: readonly Point[], bounds: Bounds, peak = maxY(points)): Point[] {
  if (points.length === 0) return [];
  const step = points.length > 1 ? bounds.width / (points.length - 1) : 0;
  return points.map((point, index) => ({
    x: index * step,
    y: bounds.height - (point.y / peak) * bounds.height,
  }));
}

/**
 * An SVG path through the points, as straight segments.
 *
 * No smoothing on purpose: a Catmull-Rom or bezier fit invents values between
 * samples, and on a spend chart that reads as spending that did not happen.
 */
export function linePath(points: readonly Point[]): string {
  if (points.length === 0) return '';
  let path = `M${round(points[0]!.x)} ${round(points[0]!.y)}`;
  for (let i = 1; i < points.length; i++) {
    path += `L${round(points[i]!.x)} ${round(points[i]!.y)}`;
  }
  return path;
}

/** Closes a line path down to the baseline, for a filled area under a sparkline. */
export function areaPath(points: readonly Point[], height: number): string {
  if (points.length === 0) return '';
  const last = points[points.length - 1]!;
  return `${linePath(points)}L${round(last.x)} ${round(height)}L${round(points[0]!.x)} ${round(height)}Z`;
}

/**
 * Two decimals is below a device pixel at any sane chart size, and trimming
 * the digits measurably shrinks the path string the bridge has to carry.
 */
function round(value: number): number {
  return Math.round(value * 100) / 100;
}
