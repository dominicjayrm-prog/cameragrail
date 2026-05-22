import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Terms of Use',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <article className="max-w-[760px] mx-auto px-7 py-10">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Terms', href: '/terms' },
        ]}
      />
      <h1 className="font-head text-[clamp(36px,5vw,60px)] font-bold tracking-[-0.03em] leading-[1.05] text-navy mt-6 mb-6">
        Terms of use
      </h1>
      <div className="space-y-4 leading-[1.7] text-ink">
        <p>
          CameraGrail provides reference information about cameras for educational
          purposes. Values are estimates based on recent sale data and are not formal
          appraisals.
        </p>
        <p>
          You retain rights to anything you submit, and grant CameraGrail a
          non-exclusive licence to display it in the catalogue.
        </p>
        <p>
          We do not handle payments or facilitate transactions. Affiliate links are
          marked and may earn us a commission at no cost to you.
        </p>
      </div>
    </article>
  );
}
