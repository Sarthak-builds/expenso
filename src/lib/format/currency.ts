/**
 * Money is an integer count of paise everywhere in this app. Division by 100
 * happens here and nowhere else. See docs/adr/0003-expense-data-model.md
 */

// Hoisted — see the same note in `date.ts`. `Intl.NumberFormat` is the most
// expensive of the three to construct and the most frequently rendered.
const rupeeFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const wholeRupeeFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const compactMantissaFormatter = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

const AMOUNT_PATTERN = /^\d*(\.\d{0,2})?$/;

/** "₹1,234.56" — the exact amount, always two decimals. */
export function formatMinor(amountMinor: number): string {
  return rupeeFormatter.format(amountMinor / 100);
}

/**
 * "₹1,235" — drops paise. Used for totals and axis labels, where two decimals
 * are noise: Geist's rule is to vary weight and grayscale for hierarchy rather
 * than to pack in more characters.
 */
export function formatMinorWhole(amountMinor: number): string {
  return wholeRupeeFormatter.format(Math.round(amountMinor / 100));
}

/**
 * "₹1.2L" / "₹3.4Cr" — Indian short scale, for KPI tiles where the figure has
 * to survive at `heading-40` inside a half-width card.
 *
 * Hand-rolled rather than `notation: 'compact'`: Hermes ships a trimmed ICU on
 * Android and compact notation is not reliably present, so the Intl path would
 * silently fall back to full digits on some devices and overflow the tile.
 */
export function formatMinorCompact(amountMinor: number): string {
  const rupees = Math.round(amountMinor / 100);
  const sign = rupees < 0 ? '-' : '';
  const abs = Math.abs(rupees);

  if (abs >= 10_000_000) return `${sign}₹${compactMantissaFormatter.format(abs / 10_000_000)}Cr`;
  if (abs >= 100_000) return `${sign}₹${compactMantissaFormatter.format(abs / 100_000)}L`;
  if (abs >= 1_000) return `${sign}₹${compactMantissaFormatter.format(abs / 1_000)}K`;
  return `${sign}₹${abs}`;
}

/**
 * Parses user input to integer paise, or `null` if it is not a valid amount.
 *
 * Deliberately textual: `Math.round(parseFloat('8.115') * 100)` is 811 on some
 * inputs and 812 on others because the intermediate is a float. Splitting on
 * the decimal point keeps the whole path in integers.
 */
export function parseAmountToMinor(input: string): number | null {
  const cleaned = input.replace(/[₹,\s]/g, '');
  if (cleaned === '' || cleaned === '.' || !AMOUNT_PATTERN.test(cleaned)) return null;

  const [rupees = '', paise = ''] = cleaned.split('.');
  const minor = Number(rupees === '' ? 0 : rupees) * 100 + Number(`${paise}00`.slice(0, 2));
  return Number.isSafeInteger(minor) ? minor : null;
}

/** Integer paise back to a bare editable string ("3050" -> "30.50"). */
export function formatMinorForInput(amountMinor: number): string {
  const rupees = Math.trunc(amountMinor / 100);
  const paise = Math.abs(amountMinor % 100);
  return paise === 0 ? String(rupees) : `${rupees}.${paise < 10 ? `0${paise}` : paise}`;
}

/** "48%" — category share of a total. Guards the zero-total case. */
export function formatShare(part: number, total: number): string {
  if (total <= 0) return '0%';
  return `${Math.round((part / total) * 100)}%`;
}
