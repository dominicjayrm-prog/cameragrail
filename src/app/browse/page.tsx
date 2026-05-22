import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { CameraCard } from '@/components/CameraCard';
import { SearchBar } from '@/components/SearchBar';
import { JsonLd } from '@/components/JsonLd';
import { listBrands, listCameras, listFormats } from '@/lib/catalogue';
import { readCurrencyCookie } from '@/lib/currency-server';
import { breadcrumbsJsonLd, collectionPageJsonLd } from '@/lib/schema';

interface Props {
  searchParams: { q?: string; brand?: string; format?: string };
}

export const metadata: Metadata = {
  title: 'Browse the Camera Archive',
  description:
    'Search and filter every camera in the CameraGrail archive by brand, format, and keyword. Find current market values and full specifications.',
  alternates: { canonical: '/browse' },
};

export default async function BrowsePage({ searchParams }: Props) {
  const currency = readCurrencyCookie();
  const all = await listCameras({
    brandSlug: searchParams.brand,
    formatSlug: searchParams.format,
    limit: 200,
  });
  const q = (searchParams.q ?? '').trim().toLowerCase();
  const results = q
    ? all.filter((c) =>
        `${c.brand} ${c.model} ${c.format}`.toLowerCase().includes(q),
      )
    : all;
  const [brands, formats] = await Promise.all([listBrands(), listFormats()]);
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Browse', href: '/browse' },
  ];
  return (
    <>
      <JsonLd
        data={[
          collectionPageJsonLd(
            'Browse cameras',
            'Full searchable index of the CameraGrail archive.',
            '/browse',
          ),
          breadcrumbsJsonLd(breadcrumbs),
        ]}
      />
      <div className="max-w-page mx-auto px-7 py-10">
        <Breadcrumbs items={breadcrumbs} />
        <header className="mt-6 mb-8">
          <h1 className="font-head text-[clamp(36px,5vw,60px)] font-bold tracking-[-0.03em] leading-[1.05] text-navy">
            Browse the archive
          </h1>
        </header>
        <div className="mb-8">
          <SearchBar initial={searchParams.q ?? ''} />
        </div>
        <div className="grid lg:grid-cols-[220px_1fr] gap-8">
          <aside className="space-y-6">
            <FilterGroup
              title="Brand"
              base="/browse"
              activeKey="brand"
              current={searchParams.brand}
              items={brands.map((b) => ({ slug: b.brand_slug, label: b.brand, count: b.count }))}
              search={searchParams}
            />
            <FilterGroup
              title="Format"
              base="/browse"
              activeKey="format"
              current={searchParams.format}
              items={formats.map((f) => ({ slug: f.format_slug, label: f.format, count: f.count }))}
              search={searchParams}
            />
          </aside>
          <section>
            <p className="text-sm text-slate mb-4">
              {results.length} {results.length === 1 ? 'result' : 'results'}
              {q ? ` for "${q}"` : ''}
            </p>
            {results.length === 0 ? (
              <p className="text-slate">
                No matches. Try a different search term or remove a filter.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {results.map((c) => (
                  <CameraCard key={c.slug} camera={c} currency={currency} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

interface FilterItem {
  slug: string;
  label: string;
  count: number;
}

function FilterGroup({
  title,
  base,
  activeKey,
  current,
  items,
  search,
}: {
  title: string;
  base: string;
  activeKey: 'brand' | 'format';
  current: string | undefined;
  items: FilterItem[];
  search: Props['searchParams'];
}) {
  const baseQuery = new URLSearchParams();
  if (search.q) baseQuery.set('q', search.q);
  if (activeKey !== 'brand' && search.brand) baseQuery.set('brand', search.brand);
  if (activeKey !== 'format' && search.format) baseQuery.set('format', search.format);
  return (
    <div>
      <h2 className="font-head text-sm font-bold uppercase tracking-[0.08em] text-slate mb-3">
        {title}
      </h2>
      <ul className="space-y-1.5 text-sm">
        <li>
          <Link
            href={baseQuery.toString() ? `${base}?${baseQuery.toString()}` : base}
            className={`block px-3 py-1.5 rounded-md transition-colors ${
              !current ? 'bg-navy text-white' : 'text-slate hover:bg-paper'
            }`}
          >
            All
          </Link>
        </li>
        {items.map((item) => {
          const params = new URLSearchParams(baseQuery);
          params.set(activeKey, item.slug);
          const active = current === item.slug;
          return (
            <li key={item.slug}>
              <Link
                href={`${base}?${params.toString()}`}
                className={`flex items-center justify-between px-3 py-1.5 rounded-md transition-colors ${
                  active ? 'bg-navy text-white' : 'text-slate hover:bg-paper'
                }`}
              >
                <span>{item.label}</span>
                <span className={`text-xs ${active ? 'text-white/60' : 'text-slate/60'}`}>
                  {item.count}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
