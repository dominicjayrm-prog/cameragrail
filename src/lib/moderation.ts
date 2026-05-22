// Server-only moderation helpers. Used by /admin/moderation and the
// approve/reject Server Actions. Operates with the service role so it
// bypasses RLS on the cameragrail schema.
import 'server-only';
import { supabaseService } from './supabase/server';
import { slugify } from './slug';

export interface NewCameraPayload {
  brand: string;
  model: string;
  slug: string;
  format: string;
  country: string | null;
  mount: string | null;
  year_start: number | null;
  year_end: number | null;
  history: string | null;
  notes: string | null;
  photo_path: string | null;
  submitter_email: string | null;
}

export interface SaleLogPayload {
  camera_id: string;
  sale_price: number;
  condition: string;
  sold_date: string | null;
  external_url: string | null;
  condition_note: string | null;
  submitter_email: string | null;
}

export interface SubmissionRow {
  id: string;
  type: 'new_camera' | 'sale_log';
  submitted_by: string | null;
  camera_id: string | null;
  payload: NewCameraPayload | SaleLogPayload;
  status: 'pending' | 'approved' | 'rejected';
  moderator_note: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export async function listPendingSubmissions(): Promise<SubmissionRow[]> {
  const supabase = supabaseService();
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(100);
  if (error || !data) return [];
  return data as SubmissionRow[];
}

export async function getSubmission(id: string): Promise<SubmissionRow | null> {
  const supabase = supabaseService();
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error || !data) return null;
  return data as SubmissionRow;
}

export interface ApprovalResult {
  brandSlug: string | null;
  modelPath: string | null;
}

export async function approveSubmission(
  id: string,
  note: string | null,
): Promise<ApprovalResult> {
  const supabase = supabaseService();
  const submission = await getSubmission(id);
  if (!submission) throw new Error('Submission not found');
  if (submission.status !== 'pending') {
    throw new Error('Submission already reviewed');
  }

  let result: ApprovalResult = { brandSlug: null, modelPath: null };
  if (submission.type === 'new_camera') {
    result = await approveNewCamera(submission);
  } else if (submission.type === 'sale_log') {
    result = await approveSaleLog(submission);
  }

  await supabase
    .from('submissions')
    .update({
      status: 'approved',
      moderator_note: note,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (submission.submitted_by) {
    // Increment contributor count on the user profile.
    const { data: profile } = await supabase
      .from('profiles')
      .select('contributions_count')
      .eq('id', submission.submitted_by)
      .maybeSingle();
    const current = profile?.contributions_count ?? 0;
    await supabase
      .from('profiles')
      .update({ contributions_count: current + 1 })
      .eq('id', submission.submitted_by);
  }

  return result;
}

export async function rejectSubmission(id: string, note: string | null) {
  const supabase = supabaseService();
  await supabase
    .from('submissions')
    .update({
      status: 'rejected',
      moderator_note: note,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id);
}

async function approveNewCamera(submission: SubmissionRow): Promise<ApprovalResult> {
  const payload = submission.payload as NewCameraPayload;
  const supabase = supabaseService();
  const brand_slug = slugify(payload.brand);
  const format_slug = slugify(payload.format);
  const slug = payload.slug || `${brand_slug}-${slugify(payload.model)}`;

  let hero_image_url: string | null = null;
  if (payload.photo_path) {
    const { data } = supabase.storage
      .from('submission-photos')
      .getPublicUrl(payload.photo_path);
    hero_image_url = data.publicUrl ?? null;
  }

  await supabase.from('cameras').upsert(
    {
      slug,
      brand: payload.brand,
      brand_slug,
      model: payload.model,
      format: payload.format,
      format_slug,
      year_start: payload.year_start,
      year_end: payload.year_end,
      country: payload.country,
      mount: payload.mount,
      history: payload.history,
      hero_image_url,
      price_source: 'community',
      published: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'slug' },
  );

  return {
    brandSlug: brand_slug,
    modelPath: slug.startsWith(`${brand_slug}-`)
      ? slug.slice(brand_slug.length + 1)
      : slug,
  };
}

async function approveSaleLog(submission: SubmissionRow): Promise<ApprovalResult> {
  const payload = submission.payload as SaleLogPayload;
  const supabase = supabaseService();

  if (!payload.camera_id) {
    // The form should reject seed-prefixed IDs before they reach moderation,
    // but if a legacy submission slips through we skip the value write.
    console.warn('[moderation] sale_log with null camera_id, skipping');
    return { brandSlug: null, modelPath: null };
  }

  await supabase.from('sold_listings').insert({
    camera_id: payload.camera_id,
    source: 'community',
    sale_price: payload.sale_price,
    currency: 'gbp',
    condition_note: payload.condition_note ?? payload.condition,
    sold_date: payload.sold_date,
    external_url: payload.external_url,
  });

  await recomputeCameraValue(payload.camera_id);

  const { data } = await supabase
    .from('cameras')
    .select('brand_slug, slug')
    .eq('id', payload.camera_id)
    .maybeSingle();
  if (!data) return { brandSlug: null, modelPath: null };
  const brand_slug = data.brand_slug as string;
  const slug = data.slug as string;
  return {
    brandSlug: brand_slug,
    modelPath: slug.startsWith(`${brand_slug}-`)
      ? slug.slice(brand_slug.length + 1)
      : slug,
  };
}

// Recompute condition-adjusted value range from approved community sales,
// then append a price_history row for today.
async function recomputeCameraValue(cameraId: string) {
  const supabase = supabaseService();
  const { data: sales } = await supabase
    .from('sold_listings')
    .select('sale_price')
    .eq('camera_id', cameraId)
    .eq('source', 'community')
    .eq('is_outlier', false)
    .not('sale_price', 'is', null);

  if (!sales || sales.length === 0) {
    console.warn(`[moderation] no community sales for ${cameraId}; value left unchanged`);
    return;
  }

  const prices = sales
    .map((s) => s.sale_price as number)
    .filter((p): p is number => typeof p === 'number')
    .sort((a, b) => a - b);
  if (prices.length === 0) {
    console.warn(`[moderation] no usable sale prices for ${cameraId}; value left unchanged`);
    return;
  }

  const medianRaw = prices[Math.floor(prices.length / 2)];
  // Outlier filter: drop anything more than 3x the median or below 1/3.
  const filtered = prices.filter(
    (p) => p >= medianRaw / 3 && p <= medianRaw * 3,
  );
  if (filtered.length === 0) {
    console.warn(`[moderation] all sales filtered as outliers for ${cameraId}; value left unchanged`);
    return;
  }

  const value_low = percentile(filtered, 0.2);
  const value_median = percentile(filtered, 0.5);
  const value_high = percentile(filtered, 0.8);

  await supabase
    .from('cameras')
    .update({
      value_low,
      value_median,
      value_high,
      value_updated_at: new Date().toISOString(),
      price_source: 'community',
    })
    .eq('id', cameraId);

  const today = new Date().toISOString().slice(0, 10);
  await supabase.from('price_history').upsert(
    {
      camera_id: cameraId,
      recorded_at: today,
      median_value: value_median,
      sample_size: filtered.length,
    },
    { onConflict: 'camera_id,recorded_at' },
  );
}

function percentile(sorted: number[], p: number): number {
  const idx = Math.min(sorted.length - 1, Math.floor(sorted.length * p));
  return sorted[idx];
}
