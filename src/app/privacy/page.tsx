import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <article className="max-w-[760px] mx-auto px-7 py-10">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Privacy', href: '/privacy' },
        ]}
      />
      <h1 className="font-head text-[clamp(36px,5vw,60px)] font-bold tracking-[-0.03em] leading-[1.05] text-navy mt-6 mb-6">
        Privacy
      </h1>
      <div className="space-y-4 leading-[1.7] text-ink">
        <p>
          CameraGrail uses privacy-friendly analytics (Plausible) that does not set
          cookies or fingerprint visitors. Microsoft Clarity is used for product
          research; you can opt out via the cookie banner.
        </p>
        <p>
          We store only the data you submit voluntarily: an email if you sign up,
          submissions and sales you log, and a free-text moderator note when we
          review your contribution.
        </p>
        <p>
          For data requests email{' '}
          <a className="lu text-navy font-semibold" href="mailto:privacy@cameragrail.com">
            privacy@cameragrail.com
          </a>.
        </p>
      </div>
    </article>
  );
}
