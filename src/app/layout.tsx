import type { Metadata, Viewport } from 'next';
import './globals.css';
import { inter, splineSans } from '@/styles/fonts';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { siteUrl } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: 'CameraGrail: Camera Values, Specs, and Price History',
    template: '%s · CameraGrail',
  },
  description:
    'The complete price guide and archive for film and digital cameras. Real sale data, full specifications, and production history for every model ever made.',
  openGraph: {
    type: 'website',
    siteName: 'CameraGrail',
    url: siteUrl(),
    title: 'CameraGrail: Camera Values, Specs, and Price History',
    description:
      'Real sale data, full specifications, and production history for every camera ever made.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CameraGrail',
    description:
      'Real sale data, full specifications, and production history for every camera ever made.',
  },
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#0E1A2B',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${splineSans.variable}`}>
      <body className="font-sans bg-paper text-ink min-h-screen flex flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
