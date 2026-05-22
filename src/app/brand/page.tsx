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
        <header className="mt-6 mb-10">
          <p className="text-[12.5px] font-bold tracking-[0.12em] text-blue uppercase mb-2">
            Browse by brand
          </p>
          <h1 className="font-head text-[clamp(36px,5vw,60px)] font-bold tracking-[-0.03em] leading-[1.05] text-navy">
            Every camera maker
          </h1>
        </header>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {brands.map((b) => (
            <Link
              key={b.brand_slug}
              href={`/brand/${b.brand_slug}`}
              className="cardh block bg-white border border-line rounded-[13px] px-5 py-5"
            >
              <p className="font-head text-[18.5px] font-bold tracking-[-0.015em] mb-1 text-navy">
                {b.brand}
              </p>
              <p className="text-[13px] text-slate">
                {b.count} {b.count === 1 ? 'model' : 'models'}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
