import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { getCurrentUser, supabaseServerClient } from '@/lib/supabase/ssr';
import { slugify } from '@/lib/slug';

export const metadata: Metadata = {
  title: 'Submit a Camera',
  description: 'Add a camera that is missing from the CameraGrail archive.',
};

const FORMATS = [
  '35mm SLR',
  '35mm Rangefinder',
  '35mm Compact',
  'Medium Format',
  'TLR',
  'Large Format',
  'Instant',
  'Half Frame',
  'APS',
  'Subminiature',
  'Vintage Digital',
  'Other',
];

interface Props {
  searchParams: { submitted?: string; error?: string };
}

export default async function SubmitPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="max-w-[640px] mx-auto px-7 py-16">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Submit a camera', href: '/submit' },
          ]}
        />
        <h1 className="font-head text-[clamp(36px,5vw,60px)] font-bold tracking-[-0.03em] text-navy mt-6 mb-4">
          Sign in to submit a camera
        </h1>
        <p className="text-slate mb-6">
          Submissions are tied to an account so we can credit your contributions
          and moderate spam. Magic-link sign-in, no password needed.
        </p>
        <Link
          href="/login?next=/submit"
          className="btn-primary inline-block px-6 py-3 rounded-pill font-semibold"
        >
          Sign in to continue
        </Link>
      </div>
    );
  }

  async function submitCamera(formData: FormData) {
    'use server';
    const u = await getCurrentUser();
    if (!u) return redirect('/login?next=/submit');

    const brand = String(formData.get('brand') ?? '').trim();
    const model = String(formData.get('model') ?? '').trim();
    const format = String(formData.get('format') ?? '').trim();
    const country = String(formData.get('country') ?? '').trim() || null;
    const mount = String(formData.get('mount') ?? '').trim() || null;
    const yearStartRaw = String(formData.get('year_start') ?? '').trim();
    const yearEndRaw = String(formData.get('year_end') ?? '').trim();
    const history = String(formData.get('history') ?? '').trim() || null;
    const notes = String(formData.get('notes') ?? '').trim() || null;

    if (!brand || !model || !format) {
      return redirect('/submit?error=missing_fields');
    }

    const year_start = yearStartRaw ? Number(yearStartRaw) : null;
    const year_end = yearEndRaw ? Number(yearEndRaw) : null;
    if (year_start != null && (year_start < 1820 || year_start > 2100)) {
      return redirect('/submit?error=invalid_year');
    }

    const photo = formData.get('photo') as File | null;
    const supabase = supabaseServerClient();
    let photo_path: string | null = null;
    if (photo && photo.size > 0) {
      const ext = (photo.name.split('.').pop() ?? 'jpg').toLowerCase();
      const path = `${u.id}/${Date.now()}-${slugify(`${brand}-${model}`)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('submission-photos')
        .upload(path, photo, { contentType: photo.type, upsert: false });
      if (uploadError) {
        return redirect(
          `/submit?error=${encodeURIComponent(uploadError.message)}`,
        );
      }
      photo_path = path;
    }

    const slug = `${slugify(brand)}-${slugify(model)}`;
    const payload = {
      brand,
      model,
      slug,
      format,
      country,
      mount,
      year_start,
      year_end,
      history,
      notes,
      photo_path,
      submitter_email: u.email,
    };

    const { error } = await supabase.from('submissions').insert({
      type: 'new_camera',
      submitted_by: u.id,
      payload,
      status: 'pending',
    });
    if (error) {
      return redirect(`/submit?error=${encodeURIComponent(error.message)}`);
    }
    return redirect('/submit?submitted=1');
  }

  return (
    <div className="max-w-[760px] mx-auto px-7 py-10">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Submit a camera', href: '/submit' },
        ]}
      />
      <header className="mt-6 mb-8">
        <h1 className="font-head text-[clamp(36px,5vw,60px)] font-bold tracking-[-0.03em] text-navy">
          Submit a camera
        </h1>
        <p className="text-slate mt-3">
          Found a model the archive is missing? Submit the basics and a photo
          if you have one. We review every submission and credit your account
          on approval.
        </p>
      </header>

      {searchParams.submitted ? (
        <div className="rounded-card border border-success/30 bg-success/5 text-success p-4 mb-6 text-sm">
          Thanks. Your submission is in the moderation queue. We will publish it
          once a moderator approves it.
        </div>
      ) : null}
      {searchParams.error ? (
        <div className="rounded-card border border-down/30 bg-down/5 text-down p-4 mb-6 text-sm">
          {decodeURIComponent(searchParams.error)}
        </div>
      ) : null}

      <form action={submitCamera} encType="multipart/form-data" className="space-y-5">
        <div className="grid md:grid-cols-2 gap-5">
          <Field label="Brand" name="brand" required placeholder="Leica" />
          <Field label="Model" name="model" required placeholder="M3" />
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <Select label="Format" name="format" required options={FORMATS} />
          <Field label="Mount" name="mount" placeholder="Leica M, Canon FD, Nikon F..." />
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          <Field
            label="First production year"
            name="year_start"
            type="number"
            min={1820}
            max={2100}
            placeholder="1954"
          />
          <Field
            label="Last production year"
            name="year_end"
            type="number"
            min={1820}
            max={2100}
            placeholder="1966"
          />
          <Field label="Country" name="country" placeholder="Germany" />
        </div>
        <Textarea
          label="Production history and notes"
          name="history"
          rows={5}
          placeholder="200 to 400 words on what makes this model notable: production details, design changes, known issues, collector appeal..."
        />
        <Textarea
          label="Anything else we should know"
          name="notes"
          rows={3}
          placeholder="Sources you used, regional variants you have seen, owner notes..."
        />
        <div>
          <label className="text-xs uppercase tracking-[0.08em] text-slate font-semibold mb-1.5 block">
            Photo (optional, max 5MB)
          </label>
          <input
            type="file"
            name="photo"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="block text-sm text-slate file:mr-3 file:px-4 file:py-2 file:rounded-[8px] file:border-0 file:bg-navy file:text-white file:font-semibold hover:file:bg-navy2 file:cursor-pointer"
          />
        </div>
        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            className="btn-primary px-7 py-3 rounded-pill font-semibold"
          >
            Submit for review
          </button>
          <p className="text-xs text-slate">
            Submissions go through a moderation queue before publishing.
          </p>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required,
  placeholder,
  min,
  max,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.08em] text-slate font-semibold mb-1.5 block">
        {label}
        {required ? <span className="text-down ml-1">*</span> : null}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        min={min}
        max={max}
        className="w-full bg-white border border-line rounded-[10px] px-4 py-2.5 outline-none focus:border-blue"
      />
    </label>
  );
}

function Select({
  label,
  name,
  required,
  options,
}: {
  label: string;
  name: string;
  required?: boolean;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.08em] text-slate font-semibold mb-1.5 block">
        {label}
        {required ? <span className="text-down ml-1">*</span> : null}
      </span>
      <select
        name={name}
        required={required}
        defaultValue=""
        className="w-full bg-white border border-line rounded-[10px] px-4 py-2.5 outline-none focus:border-blue"
      >
        <option value="" disabled>
          Choose a format…
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function Textarea({
  label,
  name,
  rows,
  placeholder,
}: {
  label: string;
  name: string;
  rows: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.08em] text-slate font-semibold mb-1.5 block">
        {label}
      </span>
      <textarea
        name={name}
        rows={rows}
        placeholder={placeholder}
        className="w-full bg-white border border-line rounded-[10px] px-4 py-2.5 outline-none focus:border-blue leading-[1.55]"
      />
    </label>
  );
}
