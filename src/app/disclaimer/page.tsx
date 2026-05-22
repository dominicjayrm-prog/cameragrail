import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { VALUE_DISCLAIMER } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Valuation and Affiliate Disclaimer',
  alternates: { canonical: '/disclaimer' },
};

export default function DisclaimerPage() {
  return (
    <article className="max-w-[760px] mx-auto px-7 py-10">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Disclaimer', href: '/disclaimer' },
        ]}
      />
      <h1 className="font-head text-[clamp(36px,5vw,60px)] font-bold tracking-[-0.03em] leading-[1.05] text-navy mt-6 mb-6">
        Disclaimer
      </h1>
      <div className="space-y-4 leading-[1.7] text-ink">
        <p>{VALUE_DISCLAIMER}</p>
        <p>
          CameraGrail participates in affiliate programmes including the eBay
          Partner Network. Some outbound links earn us a commission at no extra cost
          to you. We label affiliate links and disclose this near every listing CTA
          in line with FTC and ASA guidance.
        </p>
        <p>
          We do our best to keep values current and specifications accurate. Get in
          touch if you spot anything off and we will review.
        </p>
      </div>
    </article>
  );
}
