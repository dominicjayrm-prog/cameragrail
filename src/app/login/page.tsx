import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { supabaseServerClient, getCurrentUser } from '@/lib/supabase/ssr';
import { absoluteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: { next?: string; sent?: string; error?: string };
}

export default async function LoginPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (user) {
    redirect(searchParams.next ?? '/account');
  }

  async function signIn(formData: FormData) {
    'use server';
    const email = (formData.get('email') as string | null)?.trim();
    const next = (formData.get('next') as string | null) ?? '/account';
    if (!email) return redirect('/login?error=missing_email');
    const supabase = supabaseServerClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: absoluteUrl(
          `/auth/callback?next=${encodeURIComponent(next)}`,
        ),
      },
    });
    if (error) {
      return redirect(`/login?error=${encodeURIComponent(error.message)}`);
    }
    return redirect(`/login?sent=1&next=${encodeURIComponent(next)}`);
  }

  return (
    <div className="max-w-[460px] mx-auto px-7 py-16">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Sign in', href: '/login' },
        ]}
      />
      <h1 className="font-head text-4xl font-bold tracking-[-0.02em] text-navy mt-6 mb-3">
        Sign in to CameraGrail
      </h1>
      <p className="text-slate mb-7">
        We send a magic link to your email. No password required.
      </p>

      {searchParams.sent ? (
        <div className="rounded-card border border-success/30 bg-success/5 text-success p-4 mb-6 text-sm">
          Check your inbox. The magic link expires in one hour.
        </div>
      ) : null}
      {searchParams.error ? (
        <div className="rounded-card border border-down/30 bg-down/5 text-down p-4 mb-6 text-sm">
          {decodeURIComponent(searchParams.error)}
        </div>
      ) : null}

      <form action={signIn} className="space-y-3">
        <input type="hidden" name="next" value={searchParams.next ?? '/account'} />
        <label className="block">
          <span className="text-xs uppercase tracking-[0.08em] text-slate font-semibold mb-1.5 block">
            Email
          </span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full bg-white border border-line rounded-[10px] px-4 py-3 outline-none focus:border-blue"
          />
        </label>
        <button
          type="submit"
          className="btn-primary w-full rounded-[10px] py-3 font-semibold"
        >
          Send magic link
        </button>
      </form>
      <p className="text-xs text-slate mt-6">
        By signing in you agree to the{' '}
        <Link href="/terms" className="lu text-navy font-semibold">
          terms
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="lu text-navy font-semibold">
          privacy policy
        </Link>
        .
      </p>
    </div>
  );
}
