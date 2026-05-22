// Read-side data access for the catalogue. Hits Supabase when configured,
// falls back to the in-memory seed catalogue so the app renders out of the
// box. Replace the seed fallback once you've run the seed script against
// your Supabase project.
import { supabaseAnon } from './supabase/server';
import type { Camera, ConditionValue, PriceHistoryPoint, SoldListing } from './types';
import { seedCameras, seedToCameraRow, type SeedCamera } from './seed-data';

function hasSupabase(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

function seedAsCameras(): Camera[] {
  return seedCameras().map((seed, i) => {
    const row = seedToCameraRow(seed);
    return {
      ...row,
      id: `seed-${i}`,
      view_count: 0,
    } satisfies Camera;
  });
}

function seedConditionValues(seed: SeedCamera, cameraId: string): ConditionValue[] {
  return (Object.keys(seed.conditions) as Array<keyof SeedCamera['conditions']>).map(
    (key) => ({
      camera_id: cameraId,
      condition: key,
      value_low: seed.conditions[key][0],
      value_high: seed.conditions[key][1],
    }),
  );
}

function seedPriceHistory(seed: SeedCamera, cameraId: string): PriceHistoryPoint[] {
  // 12 monthly points walking out from the median, deterministic per slug.
  const median = seed.value_median;
  const points: PriceHistoryPoint[] = [];
  const today = new Date();
  let h = 0;
  for (let i = 0; i < seed.slug.length; i++) h = (h * 31 + seed.slug.charCodeAt(i)) | 0;
  for (let i = 11; i >= 0; i--) {
    const drift = ((h + i * 17) % 21) - 10; // -10..+10 percent
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    points.push({
      recorded_at: date.toISOString().slice(0, 10),
      median_value: Math.round(median * (1 + drift / 100)),
      sample_size: 4 + ((h + i) % 12),
    });
    void cameraId;
  }
  return points;
}

export async function listCameras(options: {
  brandSlug?: string;
  formatSlug?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<Camera[]> {
  if (!hasSupabase()) return filterSeed(seedAsCameras(), options);
  const supabase = supabaseAnon();
  let query = supabase
    .from('cameras')
    .select('*')
    .eq('published', true)
    .order('value_median', { ascending: false });
  if (options.brandSlug) query = query.eq('brand_slug', options.brandSlug);
  if (options.formatSlug) query = query.eq('format_slug', options.formatSlug);
  if (options.limit) query = query.limit(options.limit);
  if (options.offset && options.limit) {
    query = query.range(options.offset, options.offset + options.limit - 1);
  }
  const { data, error } = await query;
  // Soft-fallback only on hard error (e.g. schema not exposed, network).
  // Empty results from a configured Supabase are passed through so an admin
  // can verify the live catalogue is truly empty without seed data masking
  // it.
  if (error) {
    console.error('[catalogue] listCameras failed:', error);
    return filterSeed(seedAsCameras(), options);
  }
  return (data ?? []) as Camera[];
}

function filterSeed(
  rows: Camera[],
  options: { brandSlug?: string; formatSlug?: string; limit?: number; offset?: number },
): Camera[] {
  let filtered = rows;
  if (options.brandSlug) filtered = filtered.filter((c) => c.brand_slug === options.brandSlug);
  if (options.formatSlug) filtered = filtered.filter((c) => c.format_slug === options.formatSlug);
  if (options.offset) filtered = filtered.slice(options.offset);
  if (options.limit) filtered = filtered.slice(0, options.limit);
  return filtered;
}

export async function getCameraBySlug(
  brandSlug: string,
  modelSlug: string,
): Promise<Camera | null> {
  const fullSlug = `${brandSlug}-${modelSlug}`;
  if (!hasSupabase()) {
    return seedAsCameras().find(
      (c) => c.brand_slug === brandSlug && c.slug === fullSlug,
    ) ?? null;
  }
  const supabase = supabaseAnon();
  const { data, error } = await supabase
    .from('cameras')
    .select('*')
    .eq('brand_slug', brandSlug)
    .eq('slug', fullSlug)
    .eq('published', true)
    .maybeSingle();
  if (error) {
    console.error('[catalogue] getCameraBySlug failed:', error);
    return (
      seedAsCameras().find(
        (c) => c.brand_slug === brandSlug && c.slug === fullSlug,
      ) ?? null
    );
  }
  return (data as Camera) ?? null;
}

export async function getConditionValues(cameraId: string): Promise<ConditionValue[]> {
  if (cameraId.startsWith('seed-')) {
    const idx = Number(cameraId.split('-')[1]);
    const seed = seedCameras()[idx];
    return seed ? seedConditionValues(seed, cameraId) : [];
  }
  const supabase = supabaseAnon();
  const { data, error } = await supabase
    .from('condition_values')
    .select('*')
    .eq('camera_id', cameraId);
  if (error || !data) return [];
  return data as ConditionValue[];
}

export async function getPriceHistory(cameraId: string): Promise<PriceHistoryPoint[]> {
  if (cameraId.startsWith('seed-')) {
    const idx = Number(cameraId.split('-')[1]);
    const seed = seedCameras()[idx];
    return seed ? seedPriceHistory(seed, cameraId) : [];
  }
  const supabase = supabaseAnon();
  const { data, error } = await supabase
    .from('price_history')
    .select('*')
    .eq('camera_id', cameraId)
    .order('recorded_at', { ascending: true });
  if (error || !data) return [];
  return data as PriceHistoryPoint[];
}

export async function getCommunitySales(cameraId: string): Promise<SoldListing[]> {
  if (cameraId.startsWith('seed-')) return [];
  const supabase = supabaseAnon();
  const { data, error } = await supabase
    .from('sold_listings')
    .select('*')
    .eq('camera_id', cameraId)
    .eq('source', 'community')
    .eq('is_outlier', false)
    .order('sold_date', { ascending: false })
    .limit(12);
  if (error || !data) return [];
  return data as SoldListing[];
}

export async function getRelatedCameras(camera: Camera, limit = 6): Promise<Camera[]> {
  const all = await listCameras({ formatSlug: camera.format_slug, limit: 24 });
  const others = all.filter((c) => c.slug !== camera.slug);
  const sameBrand = others.filter((c) => c.brand_slug === camera.brand_slug);
  return [...sameBrand, ...others.filter((c) => c.brand_slug !== camera.brand_slug)].slice(
    0,
    limit,
  );
}

export async function listBrands(): Promise<Array<{ brand: string; brand_slug: string; count: number }>> {
  const all = await listCameras({ limit: 1000 });
  const map = new Map<string, { brand: string; brand_slug: string; count: number }>();
  for (const c of all) {
    const key = c.brand_slug;
    const existing = map.get(key);
    if (existing) existing.count += 1;
    else map.set(key, { brand: c.brand, brand_slug: c.brand_slug, count: 1 });
  }
  return [...map.values()].sort((a, b) => a.brand.localeCompare(b.brand));
}

export async function listFormats(): Promise<Array<{ format: string; format_slug: string; count: number }>> {
  const all = await listCameras({ limit: 1000 });
  const map = new Map<string, { format: string; format_slug: string; count: number }>();
  for (const c of all) {
    const key = c.format_slug;
    const existing = map.get(key);
    if (existing) existing.count += 1;
    else map.set(key, { format: c.format, format_slug: c.format_slug, count: 1 });
  }
  return [...map.values()].sort((a, b) => a.format.localeCompare(b.format));
}
