import type { Metadata } from 'next';
import { StubPage } from '@/components/StubPage';

export const metadata: Metadata = {
  title: 'Log a Recent Camera Sale',
  description: 'Report a camera sale to help the community track real market values.',
};

export default function LogSalePage() {
  return (
    <StubPage
      title="Log a recent sale"
      intro="Real sale data is the truth source for market value. Log what you bought or sold a camera for so the next collector has better information than you did."
      comingSoon="The sale-logging form lands in Phase 5. It will accept a camera model, sale price, condition, date, and source. Approved entries feed directly into the value calculation."
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Log a sale', href: '/log-sale' },
      ]}
    />
  );
}
