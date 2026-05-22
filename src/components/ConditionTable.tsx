import type { ConditionValue } from '@/lib/types';
import { formatFromPenceGBP, type Currency } from '@/lib/currency';

const ORDER: Array<{ key: ConditionValue['condition']; label: string; note: string }> = [
  { key: 'mint', label: 'Mint', note: 'As-new, full kit, original box' },
  { key: 'excellent', label: 'Excellent', note: 'Clean cosmetics, fully working' },
  { key: 'good', label: 'Good', note: 'Honest user, minor signs of use' },
  { key: 'for-parts', label: 'For parts', note: 'Not working, sold for spares' },
];

export function ConditionTable({
  values,
  currency,
}: {
  values: ConditionValue[];
  currency: Currency;
}) {
  const byKey = new Map(values.map((v) => [v.condition, v]));
  const max = Math.max(...values.map((v) => v.value_high ?? 0), 1);
  return (
    <div className="bg-white border border-line rounded-card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-paper">
          <tr className="text-left text-slate">
            <th className="px-5 py-3 font-semibold">Condition</th>
            <th className="px-5 py-3 font-semibold">Range</th>
            <th className="px-5 py-3 font-semibold hidden md:table-cell">Visual</th>
          </tr>
        </thead>
        <tbody>
          {ORDER.map(({ key, label, note }) => {
            const row = byKey.get(key);
            if (!row) return null;
            const low = row.value_low ?? 0;
            const high = row.value_high ?? 0;
            const leftPct = (low / max) * 100;
            const widthPct = Math.max(2, ((high - low) / max) * 100);
            return (
              <tr key={key} className="border-t border-line">
                <td className="px-5 py-4">
                  <p className="font-semibold text-ink">{label}</p>
                  <p className="text-xs text-slate mt-0.5">{note}</p>
                </td>
                <td className="px-5 py-4 font-medium text-ink whitespace-nowrap">
                  {formatFromPenceGBP(low, currency)}{' '}
                  <span className="text-slate font-normal">to</span>{' '}
                  {formatFromPenceGBP(high, currency)}
                </td>
                <td className="px-5 py-4 hidden md:table-cell w-1/2">
                  <div className="relative h-2 bg-paper rounded-pill overflow-hidden">
                    <div
                      className="absolute top-0 h-full bg-blue rounded-pill"
                      style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
