import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { getCurrentUser, supabaseServerClient } from '@/lib/supabase/ssr';
import { listCameras } from '@/lib/catalogue';

export const metadata: Metadata = {
  title: 'Log a Recent Camera Sale',
  description:
    'Report a camera sale to help the community track real market values.',
};

const CONDITIONS: Array<{ value: string; label: string }> = [
  { value: 'mint', label: 'Mint / boxed' },
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good / working' },
  { value: 'for-parts', label: 'For parts / not working' },
];

interface Props {
  searchParams: { submitted?: string; error?: string };
}

export default async function LogSalePage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="max-w-[640px] mx-auto px-7 py-16">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Log a sale', href: '/log-sale' },
          ]}
        />
        <h1 className="font-head text-[clamp(36px,5vw,60px)] font-bold tracking-[-0.03em] text-navy mt-6 mb-4">
          Sign in to log a sale
        </h1>
        <p className="text-slate mb-6">
          Sale logs feed directly into the value calculation, so we tie every
          entry to an account.
        </p>
        <Link
          href="/login?next=/log-sale"
          className="btn-primary inline-block px-6 py-3 rounded-pill font-semibold"
        >
          Sign in to continue
        </Link>
      </div>
    );
  }

  // Fetch the camera list once for the dropdown. We cap at 500 because this is
  // server-rendered; once the catalogue is large this becomes a typeahead.
  // Seed-prefixed IDs are filtered out: they are local-dev placeholders that
  // would break the foreign-key on the submissions/sold_listings tables.
  const cameras = (await listCameras({ limit: 500 })).filter(
    (c) => !c.id.startsWith('seed-'),
  );

  async function submitSale(formData: FormData) {
    'use server';
    const u = await getCurrentUser();
    if (!u) return redirect('/login?next=/log-sale');

    const cameraId = String(formData.get('camera_id') ?? '').trim();
    const priceRaw = String(formData.get('sale_price') ?? '').trim();
    const condition = String(formData.get('condition') ?? '').trim();
    const soldDateRaw = String(formData.get('sold_date') ?? '').trim() || null;
    const externalUrl = String(formData.get('external_url') ?? '').trim() || null;
    const note = String(formData.get('condition_note') ?? '').trim() || null;

    if (!cameraId || !priceRaw || !condition) {
      return redirect('/log-sale?error=missing_fields');
    }
    if (cameraId.startsWith('seed-')) {
      return redirect('/log-sale?error=seed_camera_unsupported');
    }

    const price = parseFloat(priceRaw);
    if (Number.isNaN(price) || price <= 0 || price > 1_000_000) {
      return redirect('/log-sale?error=invalid_price');
    }
    const sale_price = Math.round(price * 100); // pence

    const payload = {
      camera_id: cameraId,
      sale_price,
      condition,
      sold_date: soldDateRaw,
      external_url: externalUrl,
      condition_note: note,
      submitter_email: u.email,
    };

    const supabase = supabaseServerClient();
    const { error } = await supabase.from('submissions').insert({
      type: 'sale_log',
      submitted_by: u.id,
      camera_id: cameraId,
      payload,
      status: 'pending',
    });
    if (error) {
      return redirect(`/log-sale?error=${encodeURIComponent(error.message)}`);
    }
    return redirect('/log-sale?submitted=1');
  }

  return (
    <div className="max-w-[760px] mx-auto px-7 py-10">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Log a sale', href: '/log-sale' },
        ]}
      />
      <header className="mt-6 mb-8">
        <h1 className="font-head text-[clamp(36px,5vw,60px)] font-bold tracking-[-0.03em] text-navy">
          Log a recent sale
        </h1>
        <p className="text-slate mt-3">
          Report what you bought or sold a camera for. Approved entries feed
          directly into the model&apos;s condition-adjusted value.
        </p>
      </header>

      {searchParams.submitted ? (
        <div className="rounded-card border border-success/30 bg-success/5 text-success p-4 mb-6 text-sm">
          Thanks. A moderator will review your sale shortly.
        </div>
      ) : null}
      {searchParams.error ? (
        <div className="rounded-card border border-down/30 bg-down/5 text-down p-4 mb-6 text-sm">
          {decodeURIComponent(searchParams.error)}
        </div>
      ) : null}

      <form action={submitSale} className="space-y-5">
        <label className="block">
          <span className="text-xs uppercase tracking-[0.08em] text-slate font-semibold mb-1.5 block">
            Camera <span className="text-down">*</span>
          </span>
          <select
            name="camera_id"
            required
            defaultValue=""
            disabled={cameras.length === 0}
            className="w-full bg-white border border-line rounded-[10px] px-4 py-2.5 outline-none focus:border-blue disabled:bg-paper disabled:text-slate"
          >
            <option value="" disabled>
              {cameras.length === 0
                ? 'No cameras in the catalogue yet'
                : 'Choose a model…'}
            </option>
            {cameras.map((c) => (
              <option key={c.id} value={c.id}>
                {c.brand} {c.model} ({c.format})
              </option>
            ))}
          </select>
          <span className="text-xs text-slate mt-1.5 block">
            Don&apos;t see your model?{' '}
            <Link href="/submit" className="lu text-navy font-semibold">
              Submit it first
            </Link>
            .
          </span>
        </label>

        <div className="grid md:grid-cols-2 gap-5">
          <label className="block">
            <span className="text-xs uppercase tracking-[0.08em] text-slate font-semibold mb-1.5 block">
              Sale price (£) <span className="text-down">*</span>
            </span>
            <input
              type="number"
              name="sale_price"
              required
              min={0.01}
              step={0.01}
              placeholder="220.00"
              className="w-full bg-white border border-line rounded-[10px] px-4 py-2.5 outline-none focus:border-blue"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-[0.08em] text-slate font-semibold mb-1.5 block">
              Condition <span className="text-down">*</span>
            </span>
            <select
              name="condition"
              required
              defaultValue=""
              className="w-full bg-white border border-line rounded-[10px] px-4 py-2.5 outline-none focus:border-blue"
            >
              <option value="" disabled>
                Choose a condition…
              </option>
              {CONDITIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <label className="block">
            <span className="text-xs uppercase tracking-[0.08em] text-slate font-semibold mb-1.5 block">
              Sale date
            </span>
            <input
              type="date"
              name="sold_date"
              className="w-full bg-white border border-line rounded-[10px] px-4 py-2.5 outline-none focus:border-blue"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-[0.08em] text-slate font-semibold mb-1.5 block">
              Source URL
            </span>
            <input
              type="url"
              name="external_url"
              placeholder="https://www.ebay.co.uk/itm/..."
              className="w-full bg-white border border-line rounded-[10px] px-4 py-2.5 outline-none focus:border-blue"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-xs uppercase tracking-[0.08em] text-slate font-semibold mb-1.5 block">
            Condition note
          </span>
          <textarea
            name="condition_note"
            rows={3}
            placeholder="Body only, no lens. Light marks on top plate. Recent service."
            className="w-full bg-white border border-line rounded-[10px] px-4 py-2.5 outline-none focus:border-blue leading-[1.55]"
          />
        </label>

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            className="btn-primary px-7 py-3 rounded-pill font-semibold"
          >
            Submit sale log
          </button>
          <p className="text-xs text-slate">
            Approved sales appear on the model page within 24 hours.
          </p>
        </div>
      </form>
    </div>
  );
}
