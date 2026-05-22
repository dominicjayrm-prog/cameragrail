import type { Metadata } from 'next';
import { StubPage } from '@/components/StubPage';

export const metadata: Metadata = {
  title: 'Your Account',
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <StubPage
      title="Your account"
      intro="Sign in to track your collection, log sales, and submit cameras to the archive."
      comingSoon="Magic-link sign-in and the collection tracker land in Phase 9."
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Account', href: '/account' },
      ]}
    />
  );
}
