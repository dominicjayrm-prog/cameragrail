import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  getCameraBySlug,
  getConditionValues,
  getPriceHistory,
  getCommunitySales,
  getRelatedCameras,
  listCameras,
} from '@/lib/catalogue';
import { formatFromPenceGBP } from '@/lib/currency';
import { readCurrencyCookie } from '@/lib/currency-server';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ConditionTable } from '@/components/ConditionTable';
import { PriceHistoryChart } from '@/components/PriceHistoryChart';
import { CameraCard } from '@/components/CameraCard';
import { Faq } from '@/components/Faq';
import { AffiliateButton } from '@/components/AffiliateButton';
import { JsonLd } from '@/components/JsonLd';
import {
  breadcrumbsJsonLd,
  cameraProductJsonLd,
  faqPageJsonLd,
} from '@/lib/schema';
import { buildSearchUrl } from '@/lib/ebay';
import { VALUE_DISCLAIMER } from '@/lib/site';

interface Props {
  params: { brand: string; model: string };
}

const MIN_HISTORY_POINTS = Number(process.env.NEXT_PUBLIC_PRICE_HISTORY_MIN_POINTS ?? 4);

export const revalidate = 86400;

export async function generateStaticParams() {
  const all = await listCameras({ limit: 1000 });
  return all.map((c) => ({
    brand: c.brand_slug,
    model: c.slug.replace(`${c.brand_slug}-`, ''),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const camera = await getCameraBySlug(params.brand, params.model);
  if (!camera) return { title: 'Camera not found' };
  const years = formatYears(camera.year_start, camera.year_end);
  const title = `${camera.brand} ${camera.model} Value and Price Guide ${years}`;
  const description = camera.history?.slice(0, 156) ??
    `Current market value, full specifications, and production history for the ${camera.brand} ${camera.model}.`;
  return {
    title,
    description,
    alternates: { canonical: `/camera/${camera.brand_slug}/${params.model}` },
    openGraph: { title, description, type: 'article' },
  };
}

export default async function CameraPage({ params }: Props) {
  const camera = await getCameraBySlug(params.brand, params.model);
  if (!camera) notFound();

  const currency = readCurrencyCookie();
  const [conditions, history, sales, related] = await Promise.all([
    getConditionValues(camera.id),
    getPriceHistory(camera.id),
    getCommunitySales(camera.id),
    getRelatedCameras(camera),
  ]);

  const years = formatYears(camera.year_start, camera.year_end);
  const query = `${camera.brand} ${camera.model}`;
  const affiliateUrl = buildSearchUrl(query);
  const showChart = history.length >= MIN_HISTORY_POINTS;

  const faqs = buildFaqs(camera, currency);
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Browse', href: '/browse' },
    { label: camera.brand, href: `/brand/${camera.brand_slug}` },
    { label: camera.model, href: `/camera/${camera.brand_slug}/${params.model}` },
  ];

  return (
    <>
      <JsonLd
        data={[
          cameraProductJsonLd(camera),
          breadcrumbsJsonLd(breadcrumbs),
          faqPageJsonLd(faqs),
        ]}
      />

      <article className="max-w-page mx-auto px-7 py-10">
        <Breadcrumbs items={breadcrumbs} />

        <header className="mt-6 mb-10 grid lg:grid-cols-[1fr_auto] gap-6 items-end">
          <div>
            <p className="text-[12.5px] font-bold tracking-[0.12em] text-blue uppercase mb-2">
              {camera.format}
            </p>
            <h1 className="font-head text-[clamp(36px,5vw,60px)] font-bold tracking-[-0.03em] leading-[1.05] text-navy">
              {camera.brand} {camera.model} Value and Price Guide ({years})
            </h1>
            <p className="text-[17px] text-slate mt-3 max-w-[760px]">
              Condition-adjusted values, full specifications, production history,
              and live links to current listings.
            </p>
          </div>
          <div className="flex flex-col gap-3 items-start lg:items-end">
            {camera.rarity ? (
              <span className="text-[11px] uppercase tracking-[0.08em] font-bold px-3 py-1.5 rounded-pill bg-paper text-slate border border-line">
                {camera.rarity}
              </span>
            ) : null}
            <AffiliateButton href={affiliateUrl}>See current listings on eBay</AffiliateButton>
            <p className="text-[11px] text-slate/80 max-w-[260px] text-left lg:text-right">
              We may earn a commission from listings linked above.
            </p>
          </div>
        </header>

        <section className="grid lg:grid-cols-3 gap-6 mb-12">
          <ValueStat
            label="Low (good)"
            value={formatFromPenceGBP(camera.value_low, currency)}
          />
          <ValueStat
            label="Median (excellent)"
            value={formatFromPenceGBP(camera.value_median, currency)}
            accent
          />
          <ValueStat
            label="High (mint)"
            value={formatFromPenceGBP(camera.value_high, currency)}
          />
        </section>

        {conditions.length > 0 ? (
          <section className="mb-12">
            <h2 className="font-head text-2xl font-bold text-navy mb-4">
              Market value by condition
            </h2>
            <ConditionTable values={conditions} currency={currency} />
            <p className="text-xs text-slate mt-3">{VALUE_DISCLAIMER}</p>
          </section>
        ) : null}

        {showChart ? (
          <section className="mb-12">
            <h2 className="font-head text-2xl font-bold text-navy mb-4">
              Price history
            </h2>
            <PriceHistoryChart points={history} currency={currency} />
          </section>
        ) : null}

        <section className="grid lg:grid-cols-2 gap-10 mb-12">
          <div>
            <h2 className="font-head text-2xl font-bold text-navy mb-4">
              Specifications
            </h2>
            <SpecsTable camera={camera} />
          </div>
          {camera.history ? (
            <div>
              <h2 className="font-head text-2xl font-bold text-navy mb-4">
                Production history
              </h2>
              <p className="text-[16px] leading-[1.7] text-ink whitespace-pre-line">
                {camera.history}
              </p>
            </div>
          ) : null}
        </section>

        {sales.length > 0 ? (
          <section className="mb-12">
            <h2 className="font-head text-2xl font-bold text-navy mb-4">
              Recent community sales
            </h2>
            <ul className="bg-white border border-line rounded-card divide-y divide-line">
              {sales.map((sale) => (
                <li key={sale.id} className="px-5 py-4 flex flex-wrap justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">
                      {sale.condition_note ?? 'No condition note'}
                    </p>
                    <p className="text-xs text-slate mt-0.5">
                      {sale.sold_date ?? 'Date not recorded'}
                    </p>
                  </div>
                  <p className="font-bold text-navy">
                    {formatFromPenceGBP(sale.sale_price, currency)}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mb-12">
          <h2 className="font-head text-2xl font-bold text-navy mb-4">
            Frequently asked
          </h2>
          <Faq items={faqs} />
        </section>

        {related.length > 0 ? (
          <section>
            <h2 className="font-head text-2xl font-bold text-navy mb-4">
              Related cameras
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {related.map((rel) => (
                <CameraCard key={rel.slug} camera={rel} currency={currency} />
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <Link
                href={`/brand/${camera.brand_slug}`}
                className="lu text-navy font-semibold"
              >
                All {camera.brand} cameras →
              </Link>
              <span className="text-slate">·</span>
              <Link
                href={`/format/${camera.format_slug}`}
                className="lu text-navy font-semibold"
              >
                All {camera.format} models →
              </Link>
            </div>
          </section>
        ) : null}
      </article>
    </>
  );
}

function ValueStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className={`rounded-card p-6 border ${
        accent ? 'bg-navy text-white border-navy' : 'bg-white border-line'
      }`}
    >
      <p className={`text-xs uppercase tracking-[0.08em] mb-2 ${accent ? 'text-white/70' : 'text-slate'}`}>
        {label}
      </p>
      <p className={`font-head text-3xl font-bold tracking-[-0.02em] ${accent ? 'text-white' : 'text-navy'}`}>
        {value}
      </p>
    </div>
  );
}

function SpecsTable({ camera }: { camera: Awaited<ReturnType<typeof getCameraBySlug>> }) {
  if (!camera) return null;
  const rows: Array<[string, string | null]> = [
    ['Format', camera.format],
    ['Mount', camera.mount],
    ['Country', camera.country],
    ['Production', formatYears(camera.year_start, camera.year_end)],
  ];
  if (camera.specs) {
    for (const [k, v] of Object.entries(camera.specs)) {
      if (v == null) continue;
      rows.push([labelise(k), String(v)]);
    }
  }
  return (
    <dl className="bg-white border border-line rounded-card divide-y divide-line">
      {rows.map(([k, v]) => (
        <div key={k} className="grid grid-cols-[140px_1fr] gap-4 px-5 py-3">
          <dt className="text-sm font-semibold text-slate">{k}</dt>
          <dd className="text-sm text-ink">{v ?? '—'}</dd>
        </div>
      ))}
    </dl>
  );
}

function labelise(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatYears(start: number | null, end: number | null): string {
  if (!start && !end) return 'years unknown';
  if (start && !end) return `${start}–present`;
  if (start && end) return `${start}–${end}`;
  return `until ${end}`;
}

function buildFaqs(
  camera: NonNullable<Awaited<ReturnType<typeof getCameraBySlug>>>,
  currency: ReturnType<typeof readCurrencyCookie>,
): Array<{ q: string; a: string }> {
  const low = formatFromPenceGBP(camera.value_low, currency);
  const high = formatFromPenceGBP(camera.value_high, currency);
  const median = formatFromPenceGBP(camera.value_median, currency);
  return [
    {
      q: `How much is a ${camera.brand} ${camera.model} worth?`,
      a: `A ${camera.brand} ${camera.model} in working condition typically sells for ${low} to ${high}, with a median around ${median}. Mint or boxed examples can exceed the top of this range; non-working "for parts" bodies sell well below it.`,
    },
    {
      q: `When was the ${camera.brand} ${camera.model} made?`,
      a: `The ${camera.brand} ${camera.model} was produced from ${camera.year_start ?? 'an unknown date'}${
        camera.year_end ? ` to ${camera.year_end}` : ' onwards'
      }${camera.country ? ` in ${camera.country}` : ''}.`,
    },
    {
      q: `What format is the ${camera.brand} ${camera.model}?`,
      a: `It is a ${camera.format} camera${camera.mount ? ` using the ${camera.mount} mount` : ''}.`,
    },
    {
      q: 'Are these values formal appraisals?',
      a: `${VALUE_DISCLAIMER} For insurance or auction-grade appraisals, consult a specialist.`,
    },
  ];
}
