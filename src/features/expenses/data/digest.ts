import { addDays, todayKey, type DayKey } from '@/lib/format';

import type { CategoryId } from '../model/types';
import { monthlyTotals } from './aggregate';
import { getSummariesInRange, listInRange } from './expense.repository';

/**
 * The spend digest sent to Gemini as context.
 *
 * **This has a fixed ceiling of roughly 800 tokens regardless of data volume.**
 * 3,650 expenses produce the same digest as 50. Sending raw records instead
 * would be ~40 tokens each — about 146,000 tokens per message at 3,650 records.
 * See docs/adr/0007-gemini-integration.md
 *
 * Amounts stay in paise. The system instruction tells the model that, so no
 * division happens on either side of the wire.
 */

const TOP_LABEL_COUNT = 15;
const DIGEST_MONTHS = 18;

let cache: { revision: number; day: DayKey; text: string } | null = null;

/**
 * Builds the digest, reusing the last one when nothing has changed.
 *
 * Keyed on `revision` AND the day: an app left open past midnight must not
 * describe yesterday as "today" to the model.
 */
export function buildSpendDigest(revision: number, today: DayKey = todayKey()): string {
  if (cache && cache.revision === revision && cache.day === today) return cache.text;

  const text = composeDigest(today);
  cache = { revision, day: today, text };
  return text;
}

function composeDigest(today: DayKey): string {
  const lines: string[] = [
    `TODAY: ${today}  CURRENCY: INR  UNITS: paise`,
    `TOTALS ${windowTotals(today)}`,
  ];

  const thirtyFrom = addDays(today, -29);
  const categories = categoryTotals(thirtyFrom, today);
  if (categories) lines.push(`CAT_30D ${categories}`);

  const daily = dailySeries(thirtyFrom, today);
  if (daily) lines.push(`DAILY_30D ${daily}`);

  const labels = topLabels(thirtyFrom, today);
  if (labels) lines.push(`TOP_LABELS_30D ${labels}`);

  const monthly = monthlySeries(today);
  if (monthly) lines.push(`MONTHLY_${DIGEST_MONTHS}M ${monthly}`);

  return lines.join('\n');
}

function sumWindow(days: number, today: DayKey): number {
  let total = 0;
  for (const { summary } of getSummariesInRange(addDays(today, -(days - 1)), today)) {
    total += summary.total;
  }
  return total;
}

function windowTotals(today: DayKey): string {
  return [7, 30, 60, 180].map((days) => `d${days}=${sumWindow(days, today)}`).join(' ');
}

function categoryTotals(from: DayKey, to: DayKey): string | null {
  const totals = new Map<CategoryId, number>();
  for (const { summary } of getSummariesInRange(from, to)) {
    for (const [categoryId, amount] of Object.entries(summary.byCategory)) {
      totals.set(categoryId as CategoryId, (totals.get(categoryId as CategoryId) ?? 0) + (amount ?? 0));
    }
  }
  if (totals.size === 0) return null;

  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([categoryId, total]) => `${categoryId}=${total}`)
    .join(' ');
}

/** `08-06:45000,08-05:12000` — MM-DD only, and zero days omitted. Both save
 *  tokens; the model is told TODAY, so the year is recoverable. */
function dailySeries(from: DayKey, to: DayKey): string | null {
  const parts = getSummariesInRange(from, to)
    .filter(({ summary }) => summary.total > 0)
    .map(({ day, summary }) => `${day.slice(5)}:${summary.total}`)
    .reverse();
  return parts.length > 0 ? parts.join(',') : null;
}

/**
 * `Milk x24=72000; Auto x9=13500` — the only part that hydrates records.
 *
 * Bounded to a 30-day window and computed once per revision, and it is what
 * lets the model answer "how much on milk last month?" at all — the rollups
 * know categories but not labels.
 */
function topLabels(from: DayKey, to: DayKey): string | null {
  const byLabel = new Map<string, { count: number; total: number }>();

  for (const expense of listInRange(from, to)) {
    const key = expense.label.trim().toLowerCase();
    const entry = byLabel.get(key);
    if (entry) {
      entry.count += 1;
      entry.total += expense.amountMinor;
    } else {
      byLabel.set(key, { count: 1, total: expense.amountMinor });
    }
  }
  if (byLabel.size === 0) return null;

  return [...byLabel.entries()]
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, TOP_LABEL_COUNT)
    .map(([label, { count, total }]) => `${label} x${count}=${total}`)
    .join('; ');
}

function monthlySeries(today: DayKey): string | null {
  const months = monthlyTotals(DIGEST_MONTHS, today).filter(({ total }) => total > 0);
  if (months.length === 0) return null;
  return months.map(({ month, total }) => `${month}:${total}`).join(',');
}

/** Test/debug hook — drops the memo so the next build recomposes from storage. */
export function resetDigestCache(): void {
  cache = null;
}
