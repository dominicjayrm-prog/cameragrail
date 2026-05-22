import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'About CameraGrail',
  description:
    'CameraGrail is the price guide and archive for every camera ever made. Real sale data, full specifications, and production history.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <article className="max-w-[760px] mx-auto px-7 py-10">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'About', href: '/about' },
        ]}
      />
      <h1 className="font-head text-[clamp(36px,5vw,60px)] font-bold tracking-[-0.03em] leading-[1.05] text-navy mt-6 mb-6">
        About CameraGrail
      </h1>
      <div className="prose prose-lg text-ink space-y-5 leading-[1.7]">
        <p>
          CameraGrail is the price guide and archive for every camera ever made. We
          set out to answer one question with honest data: what is your old camera
          actually worth?
        </p>
        <p>
          Every page in the catalogue gives a condition-adjusted value range based on
          recent sold listings, the full specification sheet, production history, and
          a live link to current listings. We treat the catalogue itself as the
          product: thousands of permanent reference pages, kept current, written for
          collectors rather than search engines.
        </p>
        <h2 className="font-head text-2xl font-bold text-navy mt-8">
          Built by collectors, for collectors
        </h2>
        <p>
          Existing guides have not kept up. Print guides went out of date a decade
          ago, US-centric web sites quote dollars to a UK collector, and the largest
          wikis still have no pricing at all. CameraGrail is GBP-first with a
          currency toggle, modern, mobile-fast, and built on real transaction data
          rather than wishful asking prices.
        </p>
        <h2 className="font-head text-2xl font-bold text-navy mt-8">Community</h2>
        <p>
          You can submit a missing camera or log a sale to feed the price model.
          Every approved contribution is credited to the submitter. The catalogue
          gets better the more you use it.
        </p>
      </div>
    </article>
  );
}
