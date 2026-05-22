import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Contact CameraGrail',
  description: 'Get in touch with the CameraGrail team.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <article className="max-w-[760px] mx-auto px-7 py-10">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Contact', href: '/contact' },
        ]}
      />
      <h1 className="font-head text-[clamp(36px,5vw,60px)] font-bold tracking-[-0.03em] leading-[1.05] text-navy mt-6 mb-6">
        Contact
      </h1>
      <div className="space-y-4 leading-[1.7] text-ink">
        <p>
          For corrections, removals, press, or partnership enquiries, email
          <a className="lu text-navy font-semibold mx-1" href="mailto:hello@cameragrail.com">
            hello@cameragrail.com
          </a>
          and we will respond within two business days.
        </p>
        <p>
          For catalogue submissions and sale logs use the dedicated{' '}
          <a className="lu text-navy font-semibold" href="/submit">
            submit a camera
          </a>{' '}
          and{' '}
          <a className="lu text-navy font-semibold" href="/log-sale">
            log a sale
          </a>{' '}
          forms.
        </p>
      </div>
    </article>
  );
}
