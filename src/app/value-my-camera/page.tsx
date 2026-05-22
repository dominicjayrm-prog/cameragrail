import type { Metadata } from 'next';
import { StubPage } from '@/components/StubPage';

export const metadata: Metadata = {
  title: 'Free Camera Valuation Tool',
  description: 'Get a free estimated value for any camera based on real recent sale data.',
};

export default function ValueMyCameraPage() {
  return (
    <StubPage
      title="Value my camera"
      intro="Search any model, see the real range from recent sales, optionally save your collection and get notified when values move."
      comingSoon="The dedicated valuation tool lands in Phase 6 with email capture and price alerts. Until then, every model in the catalogue already shows a condition-adjusted value range, so search the browse page for the camera you own."
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Value my camera', href: '/value-my-camera' },
      ]}
    />
  );
}
