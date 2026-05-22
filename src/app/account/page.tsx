import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { getCurrentUser, supabaseServerClient } from '@/lib/supabase/ssr';

export const metadata: Metadata = {
  title: 'Your Account',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

interface SubmissionRow {
  id: string;
  type: string;
  status: string;
  moderator_note: string | null;
  created_at: string;
  reviewed_at: string | null;
  payload: { brand?: string; model?: string; camera_id?: string; sale_price?: number };
}

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/account');

  const supabase = supabaseServerClient();
  const [{ data: profile }, { data: submissions }] = await Promise.all([
    supabase
      .from('profiles')
      .select('display_name, contributions_count, created_at')
      .eq('id', user.id)
      .maybeSingle(),
    supabase
      .from('submissions')
      .select('id, type, status, moderator_note, created_at, reviewed_at, payload')
      .eq('submitted_by', user.id)
      .order('created_at', { ascending: false })
      .limit(50),
  ]);

  const rows: SubmissionRow[] = (submissions ?? []) as SubmissionRow[];
  const pending = rows.filter((r) => r.status === 'pending');
  const approved = rows.filter((r) => r.status === 'approved');
  const rejected = rows.filter((r) => r.status === 'rejected');

  return (
    <div className="max-w-page mx-auto px-7 py-10">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Account', href: '/account' },
        ]}
      />
      <header className="mt-6 mb-10 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[12.5px] font-bold tracking-[0.12em] text-blue uppercase mb-2">
            Account
          </p>
          <h1 className="font-head text-[clamp(36px,5vw,60px)] font-bold tracking-[-0.03em] text-navy">
            {profile?.display_name ?? user.email}
          </h1>
          <p className="text-slate mt-2">
            {user.email} ·{' '}
            <span className="font-semibold text-ink">
              {profile?.contributions_count ?? 0}{' '}
              {profile?.contributions_count === 1
                ? 'contribution'
                : 'contributions'}
            </span>{' '}
            approved
          </p>
        </div>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="text-sm text-slate hover:text-down border border-line rounded-pill px-4 py-2"
          >
            Sign out
          </button>
        </form>
      </header>

      <section className="grid md:grid-cols-3 gap-4 mb-12">
        <Stat label="Pending review" value={pending.length} accent />
        <Stat label="Approved" value={approved.length} />
        <Stat label="Rejected" value={rejected.length} />
      </section>

      <section className="mb-12">
        <div className="flex items-end justify-between mb-4 flex-wrap gap-3">
          <h2 className="font-head text-2xl font-bold text-navy">
            Your submissions
          </h2>
          <div className="flex gap-3 text-sm">
            <Link href="/submit" className="lu text-navy font-semibold">
              Submit a camera
            </Link>
            <span className="text-slate">·</span>
            <Link href="/log-sale" className="lu text-navy font-semibold">
              Log a sale
            </Link>
          </div>
        </div>
        {rows.length === 0 ? (
          <div className="bg-white border border-line rounded-card p-8 text-center text-slate">
            Nothing yet. Submit your first camera or log a sale to get started.
          </div>
        ) : (
          <ul className="bg-white border border-line rounded-card divide-y divide-line">
            {rows.map((r) => (
              <li
                key={r.id}
                className="px-5 py-4 grid grid-cols-[1fr_auto] gap-4 items-center"
              >
                <div>
                  <p className="font-semibold text-ink">
                    {r.type === 'new_camera'
                      ? `${r.payload.brand ?? '?'} ${r.payload.model ?? ''}`
                      : `Sale log${
                          r.payload.sale_price
                            ? ` · £${(r.payload.sale_price / 100).toFixed(0)}`
                            : ''
                        }`}
                  </p>
                  <p className="text-xs text-slate mt-0.5">
                    {new Date(r.created_at).toLocaleDateString('en-GB', {
                      dateStyle: 'medium',
                    })}
                    {r.moderator_note ? ` · ${r.moderator_note}` : ''}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-card p-6 border ${
        accent ? 'bg-navy text-white border-navy' : 'bg-white border-line'
      }`}
    >
      <p
        className={`text-xs uppercase tracking-[0.08em] mb-2 ${
          accent ? 'text-white/70' : 'text-slate'
        }`}
      >
        {label}
      </p>
      <p
        className={`font-head text-3xl font-bold tracking-[-0.02em] ${
          accent ? 'text-white' : 'text-navy'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pending', className: 'bg-paper text-slate border border-line' },
    approved: { label: 'Approved', className: 'bg-success/10 text-success' },
    rejected: { label: 'Rejected', className: 'bg-down/10 text-down' },
  };
  const m = map[status] ?? map.pending;
  return (
    <span
      className={`text-[10px] uppercase tracking-[0.1em] font-bold px-2 py-1 rounded-pill ${m.className}`}
    >
      {m.label}
    </span>
  );
}
