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
  searchParams: { q?: string; brand?: string; format?: string; page?: string };
}

export const metadata: Metadata = {
  title: 'Browse the Camera Archive',
  description:
    'Search and filter every camera in the CameraGrail archive by brand, format, and keyword. Find current market values and full specifications.',
  alternates: { canonical: '/browse' },
};

const PAGE_SIZE = 36;

export default async function BrowsePage({ searchParams }: Props) {
  const currency = readCurrencyCookie();
  // Pull a generous window so filter/search runs in-process. Once the
  // catalogue passes ~5,000 published rows we move this to a paged DB query.
  const all = await listCameras({
    brandSlug: searchParams.brand,
    formatSlug: searchParams.format,
    limit: 5000,
  });
  const q = (searchParams.q ?? '').trim().toLowerCase();
  const filtered = q
    ? all.filter((c) =>
        `${c.brand} ${c.model} ${c.format}`.toLowerCase().includes(q),
      )
    : all;
  const page = Math.max(1, Number(searchParams.page) || 1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const results = filtered.slice(start, start + PAGE_SIZE);
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
              {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
              {q ? ` for "${q}"` : ''}
              {totalPages > 1 ? (
                <span className="ml-2 text-slate/70">
                  · page {safePage} of {totalPages}
                </span>
              ) : null}
            </p>
            {results.length === 0 ? (
              <p className="text-slate">
                No matches. Try a different search term or remove a filter.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {results.map((c) => (
                    <CameraCard key={c.slug} camera={c} currency={currency} />
                  ))}
                </div>
                {totalPages > 1 ? (
                  <Pagination
                    currentPage={safePage}
                    totalPages={totalPages}
                    search={searchParams}
                  />
                ) : null}
              </>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

function Pagination({
  currentPage,
  totalPages,
  search,
}: {
  currentPage: number;
  totalPages: number;
  search: Props['searchParams'];
}) {
  const buildHref = (page: number) => {
    const params = new URLSearchParams();
    if (search.q) params.set('q', search.q);
    if (search.brand) params.set('brand', search.brand);
    if (search.format) params.set('format', search.format);
    if (page > 1) params.set('page', String(page));
    return params.toString() ? `/browse?${params.toString()}` : '/browse';
  };
  // Show first, last, current, and 2 neighbours; collapse the rest with "…".
  const pages = new Set<number>([1, totalPages, currentPage]);
  for (let d = 1; d <= 2; d++) {
    if (currentPage - d > 1) pages.add(currentPage - d);
    if (currentPage + d < totalPages) pages.add(currentPage + d);
  }
  const ordered = [...pages].sort((a, b) => a - b);
  return (
    <nav
      className="mt-8 flex items-center justify-center gap-2 text-sm"
      aria-label="Pagination"
    >
      {currentPage > 1 ? (
        <Link
          href={buildHref(currentPage - 1)}
          className="px-3 py-2 rounded-md border border-line bg-white text-slate hover:text-ink"
          rel="prev"
        >
          ← Previous
        </Link>
      ) : null}
      <ul className="flex items-center gap-1">
        {ordered.map((p, i) => {
          const gap = i > 0 && p - ordered[i - 1] > 1;
          return (
            <li key={p} className="flex items-center gap-1">
              {gap ? <span className="text-slate/60 px-1">…</span> : null}
              {p === currentPage ? (
                <span
                  aria-current="page"
                  className="px-3 py-1.5 rounded-md bg-navy text-white font-semibold tabular-nums"
                >
                  {p}
                </span>
              ) : (
                <Link
                  href={buildHref(p)}
                  className="px-3 py-1.5 rounded-md text-slate hover:bg-paper tabular-nums"
                >
                  {p}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
      {currentPage < totalPages ? (
        <Link
          href={buildHref(currentPage + 1)}
          className="px-3 py-2 rounded-md border border-line bg-white text-slate hover:text-ink"
          rel="next"
        >
          Next →
        </Link>
      ) : null}
    </nav>
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
