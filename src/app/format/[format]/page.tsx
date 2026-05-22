import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { CameraCard } from '@/components/CameraCard';
import { JsonLd } from '@/components/JsonLd';
import { listCameras, listFormats } from '@/lib/catalogue';
import { readCurrencyCookie } from '@/lib/currency-server';
import { breadcrumbsJsonLd, collectionPageJsonLd } from '@/lib/schema';

interface Props {
  params: { format: string };
}

export const revalidate = 86400;

export async function generateStaticParams() {
  const formats = await listFormats();
  return formats.map((f) => ({ format: f.format_slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cameras = await listCameras({ formatSlug: params.format, limit: 1 });
  if (cameras.length === 0) return { title: 'Format not found' };
  const format = cameras[0].format;
  return {
    title: `${format} Cameras: Values, Specs, and Price History`,
    description: `All ${format} cameras catalogued by CameraGrail with condition-adjusted market values and full specifications.`,
    alternates: { canonical: `/format/${params.format}` },
  };
}

export default async function FormatPage({ params }: Props) {
  const cameras = await listCameras({ formatSlug: params.format, limit: 200 });
  if (cameras.length === 0) notFound();
  const format = cameras[0].format;
  const currency = readCurrencyCookie();
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Browse', href: '/browse' },
    { label: format, href: `/format/${params.format}` },
  ];
  return (
    <>
      <JsonLd
        data={[
          collectionPageJsonLd(
            `${format} cameras`,
            `Every ${format} camera in the CameraGrail archive.`,
            `/format/${params.format}`,
          ),
          breadcrumbsJsonLd(breadcrumbs),
        ]}
      />
      <div className="max-w-page mx-auto px-7 py-10">
        <Breadcrumbs items={breadcrumbs} />
        <header className="mt-6 mb-10">
          <p className="text-[12.5px] font-bold tracking-[0.12em] text-blue uppercase mb-2">
            Format archive
          </p>
          <h1 className="font-head text-[clamp(36px,5vw,60px)] font-bold tracking-[-0.03em] leading-[1.05] text-navy">
            {format} cameras
          </h1>
          <p className="text-[17px] text-slate mt-3 max-w-[760px]">
            {cameras.length} {cameras.length === 1 ? 'model' : 'models'} catalogued.
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
