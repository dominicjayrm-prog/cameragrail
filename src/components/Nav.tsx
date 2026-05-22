import Link from 'next/link';
import { headers } from 'next/headers';
import { Logo } from './Logo';
import { CurrencyToggle } from './CurrencyToggle';
import { readCurrencyCookie } from '@/lib/currency-server';
import { getCurrentUser, isAdminEmail } from '@/lib/supabase/ssr';

const items = [
  { href: '/browse', label: 'Browse' },
  { href: '/brand', label: 'Brands' },
  { href: '/price-index', label: 'Price Index' },
  { href: '/submit', label: 'Submit a Camera' },
];

export async function Nav() {
  const currency = readCurrencyCookie();
  const pathname = headers().get('x-invoke-path') ?? '/';
  const user = await getCurrentUser();
  const admin = isAdminEmail(user?.email);
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
          {admin ? (
            <Link href="/admin/moderation" className="lu text-blue font-semibold">
              Moderation
            </Link>
          ) : null}
          <CurrencyToggle active={currency} next={pathname} />
          {user ? (
            <UserMenu email={user.email ?? ''} />
          ) : (
            <Link
              href={`/login?next=${encodeURIComponent(pathname)}`}
              className="btn-primary px-4 py-2.5 rounded-[10px] text-sm font-semibold"
            >
              Sign in
            </Link>
          )}
        </div>
        <div className="md:hidden flex items-center gap-3">
          <CurrencyToggle active={currency} next={pathname} />
          <Link
            href={user ? '/account' : `/login?next=${encodeURIComponent(pathname)}`}
            className="btn-primary px-3 py-2 rounded-[10px] text-xs font-semibold"
          >
            {user ? 'Account' : 'Sign in'}
          </Link>
        </div>
      </div>
    </nav>
  );
}

function UserMenu({ email }: { email: string }) {
  const initial = email.charAt(0).toUpperCase() || '·';
  return (
    <div className="flex items-center gap-3">
      <Link
        href="/account"
        className="flex items-center gap-2 text-sm text-ink hover:text-navy"
        aria-label="Your account"
      >
        <span className="w-7 h-7 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center">
          {initial}
        </span>
        <span className="hidden lg:inline max-w-[160px] truncate">{email}</span>
      </Link>
      <form action="/auth/signout" method="post">
        <button
          type="submit"
          className="text-xs text-slate hover:text-down transition-colors"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
