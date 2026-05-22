import Link from 'next/link';
import { Logo } from './Logo';
import { VALUE_DISCLAIMER } from '@/lib/site';

const cols = [
  {
    title: 'Catalogue',
    links: [
      { href: '/browse', label: 'Browse all cameras' },
      { href: '/brand', label: 'By brand' },
      { href: '/format/35mm-slr', label: '35mm SLRs' },
      { href: '/format/medium-format', label: 'Medium format' },
      { href: '/format/35mm-rangefinder', label: 'Rangefinders' },
      { href: '/price-index', label: 'Price index' },
    ],
  },
  {
    title: 'Contribute',
    links: [
      { href: '/submit', label: 'Submit a camera' },
      { href: '/log-sale', label: 'Log a sale' },
      { href: '/value-my-camera', label: 'Free valuation' },
      { href: '/account', label: 'Your collection' },
    ],
  },
  {
    title: 'About',
    links: [
      { href: '/about', label: 'About CameraGrail' },
      { href: '/how-values-work', label: 'How values work' },
      { href: '/contact', label: 'Contact' },
      { href: '/disclaimer', label: 'Disclaimer' },
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-navy text-white mt-24">
      <div className="max-w-page mx-auto px-7 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Logo />
              <span className="font-head text-lg font-bold tracking-tight">CameraGrail</span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              The complete price guide and archive for film and digital cameras. Real
              sale data, full specifications, production history.
            </p>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <h3 className="font-head text-sm font-semibold mb-4 text-white">
                {col.title}
              </h3>
              <ul className="space-y-2.5 text-sm">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-white/10 text-xs text-white/60 space-y-3">
          <p>{VALUE_DISCLAIMER}</p>
          <p>
            CameraGrail participates in affiliate programmes including the eBay Partner
            Network. Some links earn us a commission at no extra cost to you.
          </p>
          <p>&copy; {new Date().getFullYear()} CameraGrail. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
