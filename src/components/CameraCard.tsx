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
  const hasValues = camera.value_low != null || camera.value_high != null;
  const href = `/camera/${camera.brand_slug}/${camera.slug.replace(
    `${camera.brand_slug}-`,
    '',
  )}`;
  return (
    <Link
      href={href}
      className="cardh group block bg-white border border-line rounded-card overflow-hidden h-full"
    >
      <Thumbnail camera={camera} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-1">
          <p className="text-[11px] uppercase tracking-[0.08em] text-slate font-semibold">
            {camera.format}
          </p>
          {camera.rarity ? (
            <span className="text-[10px] uppercase tracking-[0.08em] font-semibold px-2 py-0.5 rounded-pill bg-paper text-slate border border-line shrink-0">
              {camera.rarity}
            </span>
          ) : null}
        </div>
        <h3 className="font-head text-lg font-bold text-navy leading-snug line-clamp-2 group-hover:text-blue transition-colors">
          {camera.brand} {camera.model}
        </h3>
        <p className="text-xs text-slate mt-1">{yearRange}</p>

        <div className="mt-4 pt-4 border-t border-line flex items-end justify-between gap-3">
          {hasValues ? (
            <div>
              <p className="text-[10px] text-slate uppercase tracking-[0.08em] mb-1">
                Market value
              </p>
              <p className="font-head text-base font-bold text-navy whitespace-nowrap">
                {formatFromPenceGBP(camera.value_low, currency)}
                <span className="text-slate text-xs font-medium mx-1">to</span>
                {formatFromPenceGBP(camera.value_high, currency)}
              </p>
            </div>
          ) : (
            <p className="text-[11px] text-slate italic">
              Specs and history available
            </p>
          )}
          {trend ? (
            <span
              className={`text-xs font-semibold ${
                trend.up ? 'text-success' : 'text-down'
              }`}
              aria-label={`Trend ${trend.up ? 'up' : 'down'} ${trend.value}`}
            >
              {trend.up ? '▲' : '▼'} {trend.value}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

// Per-camera visual. Uses hero_image_url when set; otherwise a deterministic
// branded placeholder built from the brand initial and a colour derived
// from the brand slug so the wall of cards doesn't read as blank.
function Thumbnail({ camera }: { camera: Camera }) {
  if (camera.hero_image_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={camera.hero_image_url}
        alt={`${camera.brand} ${camera.model}`}
        className="w-full aspect-[16/10] object-cover bg-paper"
      />
    );
  }
  const initial = (camera.brand || '?').charAt(0).toUpperCase();
  const hue = hashHue(camera.brand_slug || camera.slug);
  return (
    <div
      className="w-full aspect-[16/10] flex items-center justify-center relative"
      style={{
        background: `linear-gradient(135deg, hsl(${hue}, 30%, 96%), hsl(${(hue + 30) % 360}, 25%, 90%))`,
      }}
      aria-hidden
    >
      <span
        className="font-head text-5xl font-bold tracking-tight"
        style={{ color: `hsl(${hue}, 35%, 35%)` }}
      >
        {initial}
      </span>
      <span className="absolute bottom-2 right-3 text-[10px] uppercase tracking-[0.08em] font-semibold text-slate/70">
        {camera.format}
      </span>
    </div>
  );
}

function hashHue(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}

function formatYears(start: number | null, end: number | null): string {
  if (!start && !end) return 'Years unknown';
  if (start && !end) return `${start}–present`;
  if (start && end) return `${start}–${end}`;
  return `Until ${end}`;
}
