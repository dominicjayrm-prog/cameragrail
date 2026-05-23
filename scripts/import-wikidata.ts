/**
 * Wikidata camera importer.
 *
 * Queries the public Wikidata SPARQL endpoint for items that are instances of
 * (or subclasses of) "camera model" and friends, then upserts them into
 * cameragrail.cameras with full source attribution. External IDs are stored
 * under external_ids.wikidata so re-running this script is idempotent.
 *
 * Wikidata is CC0 (public domain), so no attribution is legally required, but
 * we record the source URL for transparency and to make corrections easier
 * later.
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/import-wikidata.ts [--limit 1000] [--dry-run]
 *
 * Flags:
 *   --limit N    Cap the number of rows imported (default 3000).
 *   --dry-run    Fetch and parse but do NOT upsert; logs a summary.
 *   --publish    Mark imported rows as published. Off by default so an editor
 *                can review them in /admin/blog-style queue before going live.
 *                For the first run with a clean catalogue you probably want
 *                --publish.
 */
import { supabaseService } from '../src/lib/supabase/server';
import { slugify } from '../src/lib/slug';

const SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql';
const USER_AGENT =
  'CameraGrailBot/0.1 (https://cameragrail.com; contact: dominicjay.rm@gmail.com)';

interface SparqlBinding {
  type: string;
  value: string;
}

interface SparqlRow {
  item: SparqlBinding;
  itemLabel?: SparqlBinding;
  itemDescription?: SparqlBinding;
  manufacturerLabel?: SparqlBinding;
  inception?: SparqlBinding;
  discontinued?: SparqlBinding;
  countryLabel?: SparqlBinding;
  lensMountLabel?: SparqlBinding;
  formatLabel?: SparqlBinding;
}

interface SparqlResponse {
  head: { vars: string[] };
  results: { bindings: SparqlRow[] };
}

interface ParsedCamera {
  wikidataId: string;
  wikidataUrl: string;
  label: string;
  description: string | null;
  brand: string | null;
  yearStart: number | null;
  yearEnd: number | null;
  country: string | null;
  mount: string | null;
  format: string;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const limit = Number(
    args[args.indexOf('--limit') + 1] ?? (args.includes('--limit') ? '3000' : '3000'),
  );
  const dryRun = args.includes('--dry-run');
  const publish = args.includes('--publish');
  return { limit: Number.isFinite(limit) ? limit : 3000, dryRun, publish };
}

// SPARQL that pulls items classified as camera models, including subclasses
// (DSLRs, rangefinders, TLRs, etc.). We also pick up formatLabel by mapping
// the camera-type tree to a sensible bucket. The path P31/P279* walks any
// number of "subclass of" hops up to the parent class.
function buildQuery(limit: number): string {
  return `
SELECT DISTINCT ?item ?itemLabel ?itemDescription
  ?manufacturerLabel ?inception ?discontinued
  ?countryLabel ?lensMountLabel ?formatLabel
WHERE {
  # Item is a camera model, a film camera, a digital camera, a rangefinder,
  # a TLR, a SLR, a DSLR, a mirrorless, an instant camera, or a medium-format
  # camera. Each clause uses P31/P279* so we capture descendant types.
  {
    VALUES ?type {
      wd:Q1373131 wd:Q15328 wd:Q15004 wd:Q193380 wd:Q540863
      wd:Q540606 wd:Q4047067 wd:Q1066851 wd:Q509194 wd:Q578895
    }
    ?item wdt:P31/wdt:P279* ?type .
  }
  OPTIONAL { ?item wdt:P176 ?manufacturer . }   # manufacturer
  OPTIONAL { ?item wdt:P571 ?inception . }      # inception
  OPTIONAL { ?item wdt:P2669 ?discontinued . }  # discontinued
  OPTIONAL { ?item wdt:P495 ?country . }        # country of origin
  OPTIONAL { ?item wdt:P1387 ?lensMount . }     # lens mount
  OPTIONAL { ?item wdt:P31 ?format . }          # use direct type as format hint
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT ${limit}
`.trim();
}

async function querySparql(query: string): Promise<SparqlResponse> {
  const url = `${SPARQL_ENDPOINT}?query=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      Accept: 'application/sparql-results+json',
      'User-Agent': USER_AGENT,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SPARQL ${res.status}: ${text.slice(0, 500)}`);
  }
  return (await res.json()) as SparqlResponse;
}

function dateToYear(value: string | undefined): number | null {
  if (!value) return null;
  const m = value.match(/^(-?\d{1,4})/);
  if (!m) return null;
  const y = Number(m[1]);
  if (!Number.isFinite(y) || y < 1800 || y > 2100) return null;
  return y;
}

function inferBrand(label: string, manufacturer: string | undefined): string | null {
  if (manufacturer && manufacturer.trim()) return manufacturer.trim();
  // If the manufacturer is missing, take the first word of the label as a
  // best-effort guess (e.g. "Canon AE-1" → "Canon"). It is a heuristic; the
  // moderator queue lets us correct outliers later.
  const first = label.trim().split(/\s+/)[0];
  return first || null;
}

function inferFormat(label: string, mount: string | undefined, formatHint: string | undefined): string {
  const haystack = `${label} ${formatHint ?? ''} ${mount ?? ''}`.toLowerCase();
  if (/medium.format|6x6|6x7|hasselblad|rolleiflex|bronica|mamiya rb|mamiya rz/.test(haystack))
    return 'Medium Format';
  if (/tlr|twin.lens/.test(haystack)) return 'TLR';
  if (/rangefinder|leica m|leica iii|contax g/.test(haystack)) return '35mm Rangefinder';
  if (/dslr|digital slr/.test(haystack)) return 'DSLR';
  if (/mirrorless/.test(haystack)) return 'Mirrorless';
  if (/instant|polaroid/.test(haystack)) return 'Instant';
  if (/digital camera|compact digital|point.and.shoot digital/.test(haystack))
    return 'Vintage Digital';
  if (/slr/.test(haystack)) return '35mm SLR';
  if (/large.format|view camera|4x5|8x10/.test(haystack)) return 'Large Format';
  if (/compact|point.and.shoot/.test(haystack)) return '35mm Compact';
  return '35mm SLR';
}

function parseRows(rows: SparqlRow[]): ParsedCamera[] {
  // Group by item URI; multiple SPARQL rows per item are common when an item
  // has multiple manufacturers or mounts.
  const map = new Map<string, ParsedCamera>();
  for (const row of rows) {
    const wikidataUrl = row.item.value;
    const wikidataId = wikidataUrl.split('/').pop() ?? '';
    if (!wikidataId || !wikidataId.startsWith('Q')) continue;
    const label = row.itemLabel?.value?.trim();
    // Skip placeholder labels like the bare "Q12345" Wikidata fallback.
    if (!label || /^Q\d+$/.test(label)) continue;
    const existing = map.get(wikidataId);
    const brand = inferBrand(label, row.manufacturerLabel?.value);
    const yearStart = dateToYear(row.inception?.value);
    const yearEnd = dateToYear(row.discontinued?.value);
    const country = row.countryLabel?.value?.trim() ?? null;
    const mount = row.lensMountLabel?.value?.trim() ?? null;
    const format = inferFormat(label, mount ?? undefined, row.formatLabel?.value);
    if (!existing) {
      map.set(wikidataId, {
        wikidataId,
        wikidataUrl,
        label,
        description: row.itemDescription?.value?.trim() ?? null,
        brand,
        yearStart,
        yearEnd,
        country,
        mount,
        format,
      });
    } else {
      existing.brand = existing.brand ?? brand;
      existing.yearStart = existing.yearStart ?? yearStart;
      existing.yearEnd = existing.yearEnd ?? yearEnd;
      existing.country = existing.country ?? country;
      existing.mount = existing.mount ?? mount;
    }
  }
  // Drop rows without a usable brand or where label IS the brand only.
  return [...map.values()].filter((c) => c.brand && c.label !== c.brand);
}

function modelFromLabel(label: string, brand: string): string {
  // Strip the brand prefix from the label if present so the slug is clean.
  const lower = label.toLowerCase();
  const prefix = brand.toLowerCase();
  if (lower.startsWith(prefix + ' ')) return label.slice(brand.length + 1).trim();
  return label.trim();
}

async function main() {
  const { limit, dryRun, publish } = parseArgs();
  console.log(`Wikidata import: limit=${limit} dryRun=${dryRun} publish=${publish}`);

  const query = buildQuery(limit);
  console.log('Running SPARQL...');
  const response = await querySparql(query);
  console.log(`Got ${response.results.bindings.length} raw bindings.`);
  const parsed = parseRows(response.results.bindings);
  console.log(`Parsed into ${parsed.length} unique camera items.`);

  if (dryRun) {
    console.log('Dry run; first 10 parsed items:');
    for (const item of parsed.slice(0, 10)) {
      const brand = item.brand ?? '(unknown)';
      console.log(
        `  ${brand} / ${modelFromLabel(item.label, brand)} (${
          item.yearStart ?? '?'
        }, ${item.format})`,
      );
    }
    return;
  }

  const supabase = supabaseService();
  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  const nowIso = new Date().toISOString();

  for (const item of parsed) {
    const brand = item.brand;
    if (!brand) {
      skipped += 1;
      continue;
    }
    const model = modelFromLabel(item.label, brand);
    if (!model || model.length > 120) {
      skipped += 1;
      continue;
    }
    const brand_slug = slugify(brand);
    const format = item.format;
    const format_slug = slugify(format);
    const slug = `${brand_slug}-${slugify(model)}`;

    // Dedup primarily on external_ids.wikidata, secondarily on slug. If
    // either matches, update; otherwise insert.
    const { data: existing } = await supabase
      .from('cameras')
      .select('id')
      .or(`slug.eq.${slug},external_ids->>wikidata.eq.${item.wikidataId}`)
      .limit(1)
      .maybeSingle();

    const row = {
      slug,
      brand,
      brand_slug,
      model,
      format,
      format_slug,
      year_start: item.yearStart,
      year_end: item.yearEnd,
      country: item.country,
      mount: item.mount,
      history: item.description,
      price_source: 'manual',
      published: publish,
      source_url: item.wikidataUrl,
      source_attribution: `Wikidata (${item.wikidataId})`,
      source_license: 'CC0',
      external_ids: { wikidata: item.wikidataId },
      updated_at: nowIso,
    };

    if (existing) {
      const { error } = await supabase
        .from('cameras')
        .update(row)
        .eq('id', existing.id);
      if (error) {
        console.error(`  ${slug}: update failed:`, error.message);
        skipped += 1;
      } else {
        updated += 1;
      }
    } else {
      const { error } = await supabase.from('cameras').insert(row);
      if (error) {
        console.error(`  ${slug}: insert failed:`, error.message);
        skipped += 1;
      } else {
        inserted += 1;
      }
    }
    if ((inserted + updated) % 50 === 0 && inserted + updated > 0) {
      console.log(`  ...${inserted} inserted, ${updated} updated`);
    }
  }

  console.log(
    `Done. inserted=${inserted} updated=${updated} skipped=${skipped} total=${parsed.length}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
