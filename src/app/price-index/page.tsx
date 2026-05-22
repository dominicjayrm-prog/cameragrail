import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { CameraCard } from '@/components/CameraCard';
import { JsonLd } from '@/components/JsonLd';
import { listCameras } from '@/lib/catalogue';
import { formatFromPenceGBP } from '@/lib/currency';
import { readCurrencyCookie } from '@/lib/currency-server';
import { breadcrumbsJsonLd, collectionPageJsonLd } from '@/lib/schema';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Camera Price Index: Most Valuable and Trending Models',
  description:
    'The CameraGrail price index. Most valuable cameras, trending models, and price movement across the archive.',
  alternates: { canonical: '/price-index' },
};

export default async function PriceIndex() {
  const currency = readCurrencyCookie();
  const top = await listCameras({ limit: 30 });
  const mostValuable = [...top].sort(
    (a, b) => (b.value_high ?? 0) - (a.value_high ?? 0),
  );
  const trending = top.slice(0, 6);
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Price index', href: '/price-index' },
  ];
  return (
    <>
      <JsonLd
        data={[
          collectionPageJsonLd(
            'Camera price index',
            'Most valuable and trending cameras in the archive.',
            '/price-index',
          ),
          breadcrumbsJsonLd(breadcrumbs),
        ]}
      />
      <div className="max-w-page mx-auto px-7 py-10">
        <Breadcrumbs items={breadcrumbs} />
        <header className="mt-6 mb-10">
          <p className="text-[12.5px] font-bold tracking-[0.12em] text-blue uppercase mb-2">
            Market index
          </p>
          <h1 className="font-head text-[clamp(36px,5vw,60px)] font-bold tracking-[-0.03em] leading-[1.05] text-navy">
            Camera price index
          </h1>
          <p className="text-[17px] text-slate mt-3 max-w-[760px]">
            Where the market is right now. The most valuable cameras in the archive,
            plus the models collectors are watching.
          </p>
        </header>

        <section className="mb-14">
          <h2 className="font-head text-2xl font-bold text-navy mb-4">
            Trending this week
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trending.map((c) => (
              <CameraCard key={c.slug} camera={c} currency={currency} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-head text-2xl font-bold text-navy mb-4">
            Most valuable in the archive
          </h2>
          <ol className="bg-white border border-line rounded-card overflow-hidden">
            {mostValuable.map((c, i) => (
              <li
                key={c.slug}
                className="grid grid-cols-[40px_1fr_auto] gap-4 items-center px-5 py-3.5 border-t first:border-t-0 border-line"
              >
                <span className="font-head text-lg font-bold text-slate tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <p className="font-semibold text-navy">
                    {c.brand} {c.model}
                  </p>
                  <p className="text-xs text-slate">{c.format}</p>
                </div>
                <p className="font-head font-bold text-navy whitespace-nowrap">
                  up to {formatFromPenceGBP(c.value_high, currency)}
                </p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </>
  );
}
