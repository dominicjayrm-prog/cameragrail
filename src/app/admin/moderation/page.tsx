import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { getCurrentUser, isAdminEmail } from '@/lib/supabase/ssr';
import {
  listPendingSubmissions,
  approveSubmission,
  rejectSubmission,
  type NewCameraPayload,
  type SaleLogPayload,
  type SubmissionRow,
} from '@/lib/moderation';
import { supabaseService } from '@/lib/supabase/server';
import { formatFromPenceGBP } from '@/lib/currency';

export const metadata: Metadata = {
  title: 'Moderation Queue',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function ModerationPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/admin/moderation');
  if (!isAdminEmail(user.email)) {
    return (
      <div className="max-w-[640px] mx-auto px-7 py-16 text-center">
        <h1 className="font-head text-3xl font-bold text-navy mb-3">
          Not authorised
        </h1>
        <p className="text-slate">
          Your account does not have moderator access. If this is a mistake,
          have an existing admin add your email to <code>ADMIN_EMAILS</code>.
        </p>
      </div>
    );
  }

  const submissions = await listPendingSubmissions();

  // Pull camera labels for sale-log rows so the moderator sees the model
  // name instead of just a UUID.
  const cameraIds = submissions
    .filter((s) => s.type === 'sale_log')
    .map((s) => (s.payload as SaleLogPayload).camera_id);
  const labels = await loadCameraLabels(cameraIds);

  async function approve(formData: FormData) {
    'use server';
    const u = await getCurrentUser();
    if (!u || !isAdminEmail(u.email)) {
      return redirect('/login?next=/admin/moderation');
    }
    const id = String(formData.get('id') ?? '');
    const note = String(formData.get('note') ?? '').trim() || null;
    const { brandSlug, modelPath } = await approveSubmission(id, note);
    revalidatePath('/admin/moderation');
    revalidatePath('/');
    revalidatePath('/price-index');
    if (brandSlug && modelPath) {
      revalidatePath(`/camera/${brandSlug}/${modelPath}`);
      revalidatePath(`/brand/${brandSlug}`);
    }
  }

  async function reject(formData: FormData) {
    'use server';
    const u = await getCurrentUser();
    if (!u || !isAdminEmail(u.email)) {
      return redirect('/login?next=/admin/moderation');
    }
    const id = String(formData.get('id') ?? '');
    const note = String(formData.get('note') ?? '').trim() || null;
    await rejectSubmission(id, note);
    revalidatePath('/admin/moderation');
  }

  return (
    <div className="max-w-page mx-auto px-7 py-10">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Moderation', href: '/admin/moderation' },
        ]}
      />
      <header className="mt-6 mb-8 flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-head text-[clamp(32px,4vw,52px)] font-bold tracking-[-0.025em] text-navy">
            Moderation queue
          </h1>
          <p className="text-slate mt-2">
            {submissions.length}{' '}
            {submissions.length === 1 ? 'item' : 'items'} pending review.
          </p>
        </div>
        <Link
          href="/admin/moderation?status=approved"
          className="lu text-sm text-slate"
        >
          View history →
        </Link>
      </header>

      {submissions.length === 0 ? (
        <div className="bg-white border border-line rounded-card p-10 text-center">
          <p className="text-slate">Inbox zero. Nothing to review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((s) => (
            <SubmissionCard
              key={s.id}
              submission={s}
              cameraLabel={
                s.type === 'sale_log'
                  ? labels.get((s.payload as SaleLogPayload).camera_id)
                  : undefined
              }
              approve={approve}
              reject={reject}
            />
          ))}
        </div>
      )}
    </div>
  );
}

async function loadCameraLabels(ids: string[]): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map();
  const supabase = supabaseService();
  const { data } = await supabase
    .from('cameras')
    .select('id, brand, model')
    .in('id', ids);
  const map = new Map<string, string>();
  for (const row of data ?? []) {
    map.set(row.id as string, `${row.brand} ${row.model}`);
  }
  return map;
}

function SubmissionCard({
  submission,
  cameraLabel,
  approve,
  reject,
}: {
  submission: SubmissionRow;
  cameraLabel: string | undefined;
  approve: (form: FormData) => Promise<void>;
  reject: (form: FormData) => Promise<void>;
}) {
  return (
    <article className="bg-white border border-line rounded-card p-6">
      <header className="flex items-start justify-between gap-4 mb-4 flex-wrap">
        <div>
          <span
            className={`text-[10px] uppercase tracking-[0.1em] font-bold px-2 py-1 rounded-pill ${
              submission.type === 'new_camera'
                ? 'bg-blue/10 text-blue'
                : 'bg-success/10 text-success'
            }`}
          >
            {submission.type === 'new_camera' ? 'New camera' : 'Sale log'}
          </span>
          <p className="text-xs text-slate mt-2">
            Submitted{' '}
            {new Date(submission.created_at).toLocaleString('en-GB', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
            {(submission.payload as { submitter_email?: string }).submitter_email
              ? ` by ${(submission.payload as { submitter_email?: string }).submitter_email}`
              : ''}
          </p>
        </div>
      </header>

      {submission.type === 'new_camera' ? (
        <NewCameraDetails payload={submission.payload as NewCameraPayload} />
      ) : (
        <SaleLogDetails
          payload={submission.payload as SaleLogPayload}
          cameraLabel={cameraLabel}
        />
      )}

      <div className="grid md:grid-cols-2 gap-3 mt-6">
        <form action={approve} className="flex gap-2">
          <input type="hidden" name="id" value={submission.id} />
          <input
            type="text"
            name="note"
            placeholder="Optional approval note"
            className="flex-1 bg-white border border-line rounded-[10px] px-3 py-2 text-sm outline-none focus:border-blue"
          />
          <button
            type="submit"
            className="bg-success text-white rounded-[10px] px-4 py-2 text-sm font-semibold hover:opacity-90"
          >
            Approve
          </button>
        </form>
        <form action={reject} className="flex gap-2">
          <input type="hidden" name="id" value={submission.id} />
          <input
            type="text"
            name="note"
            placeholder="Reason for rejection"
            className="flex-1 bg-white border border-line rounded-[10px] px-3 py-2 text-sm outline-none focus:border-blue"
          />
          <button
            type="submit"
            className="bg-down text-white rounded-[10px] px-4 py-2 text-sm font-semibold hover:opacity-90"
          >
            Reject
          </button>
        </form>
      </div>
    </article>
  );
}

function NewCameraDetails({ payload }: { payload: NewCameraPayload }) {
  return (
    <div>
      <h2 className="font-head text-xl font-bold text-navy mb-1">
        {payload.brand} {payload.model}
      </h2>
      <p className="text-sm text-slate mb-4">
        {payload.format}
        {payload.country ? ` · ${payload.country}` : ''}
        {payload.year_start
          ? ` · ${payload.year_start}${payload.year_end ? `–${payload.year_end}` : ''}`
          : ''}
        {payload.mount ? ` · ${payload.mount}` : ''}
      </p>
      {payload.history ? (
        <p className="text-sm leading-[1.6] text-ink whitespace-pre-line mb-3">
          {payload.history}
        </p>
      ) : null}
      {payload.notes ? (
        <div className="mt-3 p-3 bg-paper border border-line rounded-[10px] text-xs text-slate">
          <p className="font-semibold text-ink mb-1">Submitter notes</p>
          {payload.notes}
        </div>
      ) : null}
      {payload.photo_path ? (
        <p className="text-xs text-slate mt-3">
          Photo:{' '}
          <a
            className="lu text-navy font-semibold"
            href={photoUrl(payload.photo_path)}
            target="_blank"
            rel="noopener noreferrer"
          >
            preview
          </a>
        </p>
      ) : null}
    </div>
  );
}

function SaleLogDetails({
  payload,
  cameraLabel,
}: {
  payload: SaleLogPayload;
  cameraLabel: string | undefined;
}) {
  return (
    <div>
      <h2 className="font-head text-xl font-bold text-navy mb-1">
        {cameraLabel ?? payload.camera_id}
      </h2>
      <p className="text-sm text-slate mb-3">
        Sold for{' '}
        <span className="text-ink font-semibold">
          {formatFromPenceGBP(payload.sale_price, 'GBP')}
        </span>{' '}
        · condition <span className="text-ink font-semibold">{payload.condition}</span>
        {payload.sold_date ? ` · ${payload.sold_date}` : ''}
      </p>
      {payload.condition_note ? (
        <p className="text-sm text-ink mb-2">{payload.condition_note}</p>
      ) : null}
      {payload.external_url ? (
        <p className="text-xs text-slate">
          Source:{' '}
          <a
            className="lu text-navy font-semibold"
            href={payload.external_url}
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            {payload.external_url}
          </a>
        </p>
      ) : null}
    </div>
  );
}

function photoUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return '#';
  return `${base}/storage/v1/object/public/submission-photos/${path}`;
}
