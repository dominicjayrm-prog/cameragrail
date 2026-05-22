import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { CameraCard } from '@/components/CameraCard';
import { JsonLd } from '@/components/JsonLd';
import { listBrands, listCameras } from '@/lib/catalogue';
import { readCurrencyCookie } from '@/lib/currency-server';
import { breadcrumbsJsonLd, collectionPageJsonLd } from '@/lib/schema';

interface Props {
  params: { brand: string };
}

export const revalidate = 86400;

export async function generateStaticParams() {
  const brands = await listBrands();
  return brands.map((b) => ({ brand: b.brand_slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cameras = await listCameras({ brandSlug: params.brand, limit: 1 });
  if (cameras.length === 0) return { title: 'Brand not found' };
  const brand = cameras[0].brand;
  return {
    title: `${brand} Cameras: Values, Specs, and Price History`,
    description: `Browse every ${brand} camera in the CameraGrail archive with condition-adjusted market values, production years, and full specifications.`,
    alternates: { canonical: `/brand/${params.brand}` },
  };
}

export default async function BrandPage({ params }: Props) {
  const cameras = await listCameras({ brandSlug: params.brand, limit: 200 });
  if (cameras.length === 0) notFound();
  const brand = cameras[0].brand;
  const currency = readCurrencyCookie();

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Brands', href: '/brand' },
    { label: brand, href: `/brand/${params.brand}` },
  ];

  return (
    <>
      <JsonLd
        data={[
          collectionPageJsonLd(
            `${brand} Cameras`,
            `All ${brand} cameras with market values and specs.`,
            `/brand/${params.brand}`,
          ),
          breadcrumbsJsonLd(breadcrumbs),
        ]}
      />
      <div className="max-w-page mx-auto px-7 py-10">
        <Breadcrumbs items={breadcrumbs} />
        <header className="mt-6 mb-10">
          <p className="text-[12.5px] font-bold tracking-[0.12em] text-blue uppercase mb-2">
            Brand archive
          </p>
          <h1 className="font-head text-[clamp(36px,5vw,60px)] font-bold tracking-[-0.03em] leading-[1.05] text-navy">
            {brand} cameras
          </h1>
          <p className="text-[17px] text-slate mt-3 max-w-[760px]">
            {cameras.length} {cameras.length === 1 ? 'model' : 'models'} catalogued.
            Click any model for full specifications, production history, and current
            market value.
          </p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cameras.map((c) => (
            <CameraCard key={c.slug} camera={c} currency={currency} />
          ))}
        </div>
      </div>
    </>
  );
}
