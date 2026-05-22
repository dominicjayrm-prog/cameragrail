import { CURRENCIES, type Currency } from '@/lib/currency';

interface Props {
  active: Currency;
  next?: string;
}

export function CurrencyToggle({ active, next = '/' }: Props) {
  return (
    <form
      method="post"
      action="/api/currency"
      className="inline-flex items-center gap-0 rounded-pill border border-line bg-white p-1"
    >
      <input type="hidden" name="next" value={next} />
      {CURRENCIES.map((c) => (
        <button
          key={c}
          type="submit"
          name="currency"
          value={c}
          className={`px-3 py-1 text-xs font-semibold rounded-pill transition-colors ${
            c === active ? 'bg-navy text-white' : 'text-slate hover:text-ink'
          }`}
          aria-pressed={c === active}
        >
          {c}
        </button>
      ))}
    </form>
  );
}
