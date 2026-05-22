import Link from 'next/link';
import type { Camera } from '@/lib/types';
import { formatFromPenceGBP, type Currency } from '@/lib/currency';

interface Props {
  camera: Camera;
  currency: Currency;
  trend?: { value: string; up: boolean };
}

export function CameraCard({ camera, currency, trend }: Props) {
  const yearRange = formatYears(camera.year_start, camera.year_end);
  const low = formatFromPenceGBP(camera.value_low, currency);
  const high = formatFromPenceGBP(camera.value_high, currency);
  return (
    <Link
      href={`/camera/${camera.brand_slug}/${camera.slug.replace(`${camera.brand_slug}-`, '')}`}
      className="cardh block bg-white border border-line rounded-card p-6"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate font-semibold mb-1">
            {camera.format}
          </p>
          <h3 className="font-head text-xl font-semibold text-navy leading-tight">
            {camera.brand} {camera.model}
          </h3>
          <p className="text-sm text-slate mt-1">{yearRange}</p>
        </div>
        {camera.rarity ? (
          <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-pill bg-paper text-slate border border-line shrink-0">
            {camera.rarity}
          </span>
        ) : null}
      </div>
      <div className="flex items-end justify-between mt-6 pt-4 border-t border-line">
        <div>
          <p className="text-xs text-slate mb-1">Market value</p>
          <p className="font-head text-lg font-bold text-navy">
            {low} <span className="text-slate text-sm font-medium">to</span> {high}
          </p>
        </div>
        {trend ? (
          <div
            className={`text-sm font-semibold ${trend.up ? 'text-success' : 'text-down'}`}
            aria-label={`Trend ${trend.up ? 'up' : 'down'} ${trend.value}`}
          >
            {trend.up ? '▲' : '▼'} {trend.value}
          </div>
        ) : null}
      </div>
    </Link>
  );
}

function formatYears(start: number | null, end: number | null): string {
  if (!start && !end) return 'Production years unknown';
  if (start && !end) return `${start}–present`;
  if (start && end) return `${start}–${end}`;
  return `Until ${end}`;
}
