export type Currency = 'GBP' | 'USD' | 'EUR';

export const CURRENCIES: Currency[] = ['GBP', 'USD', 'EUR'];
export const CURRENCY_COOKIE = 'cg_currency';

// Static reference rates against GBP. Refresh quarterly. In a future iteration
// these come from a daily FX job; for v1 the catalogue stores everything in
// pence GBP and these convert for display.
const RATES_FROM_GBP: Record<Currency, number> = {
  GBP: 1,
  USD: 1.27,
  EUR: 1.17,
};

const SYMBOLS: Record<Currency, string> = {
  GBP: '£',
  USD: '$',
  EUR: '€',
};

export function isCurrency(value: unknown): value is Currency {
  return typeof value === 'string' && (CURRENCIES as string[]).includes(value);
}

// Catalogue stores values as integer pence GBP. Convert for display.
export function formatFromPenceGBP(
  penceGbp: number | null | undefined,
  currency: Currency,
  options: { round?: number } = {},
): string {
  if (penceGbp == null) return '—';
  const gbp = penceGbp / 100;
  const converted = gbp * RATES_FROM_GBP[currency];
  const rounded = roundForDisplay(converted, options.round);
  return `${SYMBOLS[currency]}${rounded.toLocaleString('en-GB', {
    maximumFractionDigits: rounded >= 100 ? 0 : 2,
  })}`;
}

function roundForDisplay(value: number, round?: number): number {
  if (round) return Math.round(value / round) * round;
  if (value >= 1000) return Math.round(value / 10) * 10;
  if (value >= 100) return Math.round(value);
  return Math.round(value * 100) / 100;
}

export function symbolFor(currency: Currency): string {
  return SYMBOLS[currency];
}
