import type { Metadata } from 'next';
import { StubPage } from '@/components/StubPage';

export const metadata: Metadata = {
  title: 'Submit a Camera',
  description: 'Add a camera that is missing from the CameraGrail archive.',
  robots: { index: true, follow: true },
};

export default function SubmitPage() {
  return (
    <StubPage
      title="Submit a camera"
      intro="Found a model the archive is missing? Help build the most complete camera catalogue anywhere."
      comingSoon="The submission form lands in Phase 5. It will let you add a missing model with brand, format, production years, specifications, and photos. Every submission is credited."
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Submit a camera', href: '/submit' },
      ]}
    />
  );
}
