// Seed the live Supabase project with the curated starter catalogue.
// Run with: SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/seed.ts
//
// Requires the cameragrail schema to be exposed via the PostgREST API. In
// Supabase dashboard go to Settings → API → Exposed schemas and add
// `cameragrail`. The service-role key bypasses RLS for the import.
import { seedCameras, seedToCameraRow } from '../src/lib/seed-data';
import { supabaseService } from '../src/lib/supabase/server';

async function main() {
  const supabase = supabaseService();
  const seeds = seedCameras();
  console.log(`Seeding ${seeds.length} cameras...`);

  for (const seed of seeds) {
    const row = seedToCameraRow(seed);
    const { data: camera, error } = await supabase
      .from('cameras')
      .upsert(row, { onConflict: 'slug' })
      .select('id')
      .single();
    if (error || !camera) {
      console.error(`  ${seed.slug}: ${error?.message}`);
      continue;
    }

    const conditionRows = (Object.keys(seed.conditions) as Array<
      keyof typeof seed.conditions
    >).map((key) => ({
      camera_id: camera.id,
      condition: key,
      value_low: seed.conditions[key][0],
      value_high: seed.conditions[key][1],
    }));
    const { error: cErr } = await supabase
      .from('condition_values')
      .upsert(conditionRows, { onConflict: 'camera_id,condition' });
    if (cErr) console.error(`  ${seed.slug} conditions: ${cErr.message}`);

    const today = new Date();
    let h = 0;
    for (let i = 0; i < seed.slug.length; i++) h = (h * 31 + seed.slug.charCodeAt(i)) | 0;
    const historyRows = Array.from({ length: 12 }, (_, i) => {
      const idx = 11 - i;
      const drift = ((h + idx * 17) % 21) - 10;
      const date = new Date(today.getFullYear(), today.getMonth() - idx, 1);
      return {
        camera_id: camera.id,
        recorded_at: date.toISOString().slice(0, 10),
        median_value: Math.round(seed.value_median * (1 + drift / 100)),
        sample_size: 4 + ((h + idx) % 12),
      };
    });
    const { error: hErr } = await supabase
      .from('price_history')
      .upsert(historyRows, { onConflict: 'camera_id,recorded_at' });
    if (hErr) console.error(`  ${seed.slug} history: ${hErr.message}`);

    console.log(`  ${seed.slug} ✓`);
  }
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
