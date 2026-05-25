import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { JsonLd } from '@/components/JsonLd';
import { listBrands } from '@/lib/catalogue';
import { breadcrumbsJsonLd, collectionPageJsonLd } from '@/lib/schema';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Camera Brands: Every Maker in the Archive',
  description:
    'Browse cameras by brand. Leica, Hasselblad, Canon, Nikon, Olympus, Pentax, Mamiya, Rolleiflex, Contax, and more, all with current market values and full specifications.',
  alternates: { canonical: '/brand' },
};

export default async function BrandIndex() {
  const brands = await listBrands();
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Brands', href: '/brand' },
  ];

  // Group by first letter so the page scans well at scale. Numbers and
  // non-Latin starters live under "#".
  const groups = new Map<string, typeof brands>();
  for (const b of brands) {
    const first = b.brand.charAt(0).toUpperCase();
    const key = /[A-Z]/.test(first) ? first : '#';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(b);
  }
  const sectionKeys = [...groups.keys()].sort();
  const totalModels = brands.reduce((s, b) => s + b.count, 0);

  return (
    <>
      <JsonLd
        data={[
          collectionPageJsonLd(
            'Camera brands',
            'All camera makers catalogued by CameraGrail.',
            '/brand',
          ),
          breadcrumbsJsonLd(breadcrumbs),
        ]}
      />
      <div className="max-w-page mx-auto px-7 py-10">
        <Breadcrumbs items={breadcrumbs} />
        <header className="mt-6 mb-8">
          <p className="text-[12.5px] font-bold tracking-[0.12em] text-blue uppercase mb-2">
            Browse by brand
          </p>
          <h1 className="font-head text-[clamp(36px,5vw,60px)] font-bold tracking-[-0.03em] leading-[1.05] text-navy">
            Every camera maker
          </h1>
          <p className="text-[15px] text-slate mt-3 max-w-[680px]">
            {brands.length} {brands.length === 1 ? 'brand' : 'brands'} covering{' '}
            {totalModels.toLocaleString('en-GB')}{' '}
            {totalModels === 1 ? 'model' : 'models'}.
          </p>
        </header>

        {sectionKeys.length > 1 ? (
          <nav
            aria-label="Jump to letter"
            className="mb-8 flex flex-wrap gap-1.5 text-sm"
          >
            {sectionKeys.map((k) => (
              <a
                key={k}
                href={`#letter-${k}`}
                className="px-2.5 py-1 rounded-md border border-line text-slate hover:bg-paper hover:text-ink font-semibold tabular-nums"
              >
                {k}
              </a>
            ))}
          </nav>
        ) : null}

        {sectionKeys.map((k) => (
          <section key={k} className="mb-10">
            <h2
              id={`letter-${k}`}
              className="font-head text-2xl font-bold text-navy mb-4 scroll-mt-20"
            >
              {k}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {groups.get(k)!.map((b) => (
                <Link
                  key={b.brand_slug}
                  href={`/brand/${b.brand_slug}`}
                  className="cardh block bg-white border border-line rounded-[13px] px-5 py-5"
                >
                  <p className="font-head text-[18px] font-bold tracking-[-0.015em] mb-1 text-navy line-clamp-1">
                    {b.brand}
                  </p>
                  <p className="text-[13px] text-slate">
                    {b.count} {b.count === 1 ? 'model' : 'models'}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
