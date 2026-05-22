import Link from 'next/link';
import { SearchBar } from '@/components/SearchBar';
import { CameraCard } from '@/components/CameraCard';
import { JsonLd } from '@/components/JsonLd';
import { listCameras, listFormats } from '@/lib/catalogue';
import { formatFromPenceGBP } from '@/lib/currency';
import { readCurrencyCookie } from '@/lib/currency-server';
import { organizationJsonLd, websiteJsonLd } from '@/lib/schema';

const POPULAR = ['Canon AE-1', 'Nikon F3', 'Olympus OM-1', 'Mamiya RB67', 'Contax T2'];

const STATS = [
  { n: '41,800', l: 'Cameras catalogued' },
  { n: '2.4M', l: 'Real sale records' },
  { n: '1,100+', l: 'Brands and makers' },
  { n: 'Daily', l: 'Price updates' },
];

export default async function HomePage() {
  const currency = readCurrencyCookie();
  const featured = (await listCameras({ limit: 6 })).slice(0, 6);
  const formats = await listFormats();

  return (
    <>
      <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />

      {/* HERO */}
      <section className="relative px-7 pt-20 pb-16 overflow-hidden">
        <div
          aria-hidden
          className="absolute -top-10 right-[-60px] w-[520px] h-[520px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(45,108,223,0.12), transparent 65%)',
          }}
        />
        <div className="max-w-page mx-auto relative">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue/10 text-blue rounded-pill text-[13px] font-semibold mb-7 animate-rise">
            <span className="w-1.5 h-1.5 rounded-full bg-blue" />
            41,800 cameras catalogued, prices updated daily
          </div>

          <h1 className="font-head text-[clamp(46px,6.4vw,84px)] leading-[1.03] font-bold tracking-[-0.035em] max-w-[900px] mb-6 text-navy animate-rise rise-1">
            What is your old camera <span className="text-blue">actually</span> worth?
          </h1>

          <p className="text-[20px] leading-[1.55] text-slate max-w-[600px] mb-9 animate-rise rise-2">
            The complete price guide and archive for film and digital cameras. Real
            sale data, full specifications, and production history for every model
            ever made, from a £30 point-and-shoot to a £30,000 Leica.
          </p>

          <div className="max-w-[640px] mb-4 animate-rise rise-3">
            <SearchBar size="lg" />
          </div>

          <div className="text-[13.5px] text-slate/80 flex gap-4 flex-wrap items-center animate-rise rise-4">
            <span>Popular:</span>
            {POPULAR.map((t) => (
              <Link
                key={t}
                href={`/browse?q=${encodeURIComponent(t)}`}
                className="lu text-slate hover:text-ink"
              >
                {t}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-line bg-white">
        <div className="max-w-page mx-auto px-7 py-8 grid grid-cols-2 md:grid-cols-4 gap-5">
          {STATS.map((s) => (
            <div key={s.l}>
              <p className="font-head text-[33px] font-bold tracking-[-0.02em] leading-none text-navy">
                {s.n}
              </p>
              <p className="text-[12.5px] text-slate mt-1.5 uppercase tracking-[0.05em]">
                {s.l}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="px-7 py-20">
        <div className="max-w-page mx-auto">
          <div className="flex items-end justify-between mb-9 flex-wrap gap-3.5">
            <div>
              <p className="text-[12.5px] font-bold tracking-[0.12em] text-blue mb-2.5 uppercase">
                Trending this week
              </p>
              <h2 className="font-head text-[clamp(28px,3.8vw,44px)] font-bold tracking-[-0.025em] leading-[1.05] text-navy">
                Cameras collectors are watching
              </h2>
            </div>
            <Link
              href="/price-index"
              className="lu text-[15px] text-navy font-semibold"
            >
              View full price index →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((camera) => (
              <CameraCard key={camera.slug} camera={camera} currency={currency} />
            ))}
          </div>
        </div>
      </section>

      {/* VALUE TOOL */}
      <section className="px-7 py-20 bg-navy text-paper relative overflow-hidden">
        <div
          aria-hidden
          className="absolute -top-32 -left-20 w-[440px] h-[440px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(45,108,223,0.25), transparent 70%)',
          }}
        />
        <div className="max-w-page mx-auto relative grid md:grid-cols-2 gap-14 items-center">
          <div>
            <p className="text-[12.5px] font-bold tracking-[0.12em] text-blue-soft mb-3.5 uppercase">
              The valuation tool
            </p>
            <h2 className="font-head text-[clamp(28px,3.8vw,46px)] font-bold tracking-[-0.025em] leading-[1.08] mb-4 text-white">
              Know what it&apos;s worth in <span className="text-blue-soft">seconds</span>, not guesses.
            </h2>
            <p className="text-[17.5px] leading-[1.6] text-white/65 mb-7">
              Every camera page shows the real range from recent sales, not wishful
              asking prices. See condition-adjusted values, production history, full
              specs, and a live link to current listings.
            </p>
            {[
              { n: '01', t: 'Search any model', d: '41,800 cameras and lenses, fully catalogued.' },
              { n: '02', t: 'See the real range', d: 'Condition-adjusted values from millions of actual sales.' },
              { n: '03', t: 'Buy, sell, or hold', d: 'Live links to current listings, plus price-trend history.' },
            ].map((s) => (
              <div key={s.n} className="flex gap-4 items-start mb-4 last:mb-0">
                <p className="font-head text-[17px] text-blue-soft font-bold min-w-[26px]">
                  {s.n}
                </p>
                <div>
                  <p className="text-base font-semibold text-white mb-1">{s.t}</p>
                  <p className="text-[15px] text-white/60">{s.d}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Sample card */}
          <SampleCard currency={currency} />
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="px-7 py-20">
        <div className="max-w-page mx-auto">
          <p className="text-[12.5px] font-bold tracking-[0.12em] text-blue mb-2.5 uppercase">
            Browse the archive
          </p>
          <h2 className="font-head text-[clamp(28px,3.8vw,44px)] font-bold tracking-[-0.025em] mb-9 text-navy">
            Every format, every maker
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {formats.length > 0
              ? formats.map((f) => (
                  <Link
                    key={f.format_slug}
                    href={`/format/${f.format_slug}`}
                    className="cardh block bg-white border border-line rounded-[13px] px-5 py-5"
                  >
                    <p className="font-head text-[18.5px] font-bold tracking-[-0.015em] mb-1 text-navy">
                      {f.format}
                    </p>
                    <p className="text-[13px] text-slate">
                      {f.count} {f.count === 1 ? 'model' : 'models'}
                    </p>
                  </Link>
                ))
              : null}
          </div>
        </div>
      </section>

      {/* SUBMIT */}
      <section className="px-7 py-20 bg-white border-t border-line">
        <div className="max-w-[1020px] mx-auto text-center">
          <p className="text-[12.5px] font-bold tracking-[0.12em] text-blue mb-3.5 uppercase">
            Help build the archive
          </p>
          <h2 className="font-head text-[clamp(28px,4vw,48px)] font-bold tracking-[-0.025em] leading-[1.08] mb-4 text-navy">
            Found a camera that history forgot?
          </h2>
          <p className="text-[18.5px] leading-[1.6] text-slate max-w-[680px] mx-auto mb-7">
            Some of the rarest cameras ever made aren&apos;t in any database. If you own
            an obscure model, an unmarked maker, or a regional variant nobody has
            documented, add it to the archive. Every submission is credited and helps
            the next collector.
          </p>
          <div className="flex gap-3.5 justify-center flex-wrap">
            <Link
              href="/submit"
              className="btn-primary px-7 py-4 rounded-pill text-[15.5px] font-semibold"
            >
              Submit a camera
            </Link>
            <Link
              href="/log-sale"
              className="bg-transparent text-navy border-[1.5px] border-[#C2D0E4] px-7 py-4 rounded-pill text-[15.5px] font-semibold hover:bg-paper transition-colors"
            >
              Log a recent sale
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function SampleCard({ currency }: { currency: ReturnType<typeof readCurrencyCookie> }) {
  const rows: Array<{ c: string; low: number; high: number; w: string }> = [
    { c: 'Mint / boxed', low: 19000, high: 26000, w: '100%' },
    { c: 'Excellent', low: 13000, high: 18000, w: '72%' },
    { c: 'Good / working', low: 8000, high: 12000, w: '48%' },
    { c: 'For parts', low: 2500, high: 5000, w: '20%' },
  ];
  return (
    <div className="bg-paper text-ink rounded-[18px] p-7 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.55)]">
      <div className="flex justify-between items-start mb-5">
        <div>
          <p className="font-head text-[27px] font-bold tracking-[-0.02em] text-navy">
            Olympus OM-1
          </p>
          <p className="text-[13.5px] text-slate/80 mt-1">
            1972–1979 · 35mm SLR · Japan
          </p>
        </div>
        <span className="text-xs font-bold text-success bg-success/10 px-2.5 py-1 rounded-pill">
          ▲ +9%
        </span>
      </div>
      <div className="bg-white border border-line rounded-[13px] p-5 mb-4">
        <p className="text-[11.5px] text-slate/80 uppercase tracking-[0.06em] mb-3">
          Market value by condition
        </p>
        {rows.map((r, i) => (
          <div key={r.c} className={i < rows.length - 1 ? 'mb-3' : ''}>
            <div className="flex justify-between mb-1.5">
              <span className="text-[13.5px] text-ink">{r.c}</span>
              <span className="text-[13.5px] font-bold text-navy">
                {formatFromPenceGBP(r.low, currency)} to {formatFromPenceGBP(r.high, currency)}
              </span>
            </div>
            <div className="h-1.5 bg-line rounded-pill overflow-hidden">
              <div className="h-full bg-blue rounded-pill" style={{ width: r.w }} />
            </div>
          </div>
        ))}
      </div>
      <Link
        href="/camera/olympus/om-1"
        className="block w-full text-center btn-primary py-3.5 rounded-[11px] text-[15px] font-semibold"
      >
        See full Olympus OM-1 page →
      </Link>
    </div>
  );
}
