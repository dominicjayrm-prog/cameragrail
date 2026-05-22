import Link from 'next/link';
import { headers } from 'next/headers';
import { Logo } from './Logo';
import { CurrencyToggle } from './CurrencyToggle';
import { readCurrencyCookie } from '@/lib/currency-server';

const items = [
  { href: '/browse', label: 'Browse' },
  { href: '/brand', label: 'Brands' },
  { href: '/price-index', label: 'Price Index' },
  { href: '/submit', label: 'Submit a Camera' },
];

export function Nav() {
  const currency = readCurrencyCookie();
  const pathname = headers().get('x-invoke-path') ?? '/';
  return (
    <nav className="sticky top-0 z-50 bg-paper/90 backdrop-blur border-b border-line">
      <div className="max-w-page mx-auto px-7 flex items-center justify-between py-3.5">
        <Link href="/" className="flex items-center gap-3" aria-label="CameraGrail home">
          <Logo />
          <span className="font-head text-[20px] font-bold tracking-tight text-navy">
            CameraGrail
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-7 text-[14.5px]">
          {items.map((item) => (
            <Link key={item.href} href={item.href} className="lu text-slate hover:text-ink">
              {item.label}
            </Link>
          ))}
          <CurrencyToggle active={currency} next={pathname} />
          <Link
            href="/value-my-camera"
            className="btn-primary px-4 py-2.5 rounded-[10px] text-sm font-semibold"
          >
            Value my camera
          </Link>
        </div>
        <div className="md:hidden flex items-center gap-3">
          <CurrencyToggle active={currency} next={pathname} />
          <Link
            href="/browse"
            className="btn-primary px-3 py-2 rounded-[10px] text-xs font-semibold"
          >
            Browse
          </Link>
        </div>
      </div>
    </nav>
  );
}
