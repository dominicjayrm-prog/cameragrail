// Hand-curated seed catalogue. Fact-checked specs and approximate price
// ranges in pence GBP based on public sold-listing data circa late 2025.
// Replace with live API-driven values once the eBay integration is approved.
//
// SAMPLE DATA: this is clearly flagged so it can be swapped for a real seed
// import. Do not treat these values as production appraisals.
import type { Camera, CameraSpecs, Rarity } from './types';

export interface SeedCamera {
  slug: string;
  brand: string;
  model: string;
  format: string;
  year_start: number | null;
  year_end: number | null;
  country: string | null;
  mount: string | null;
  rarity: Rarity;
  value_low: number;
  value_median: number;
  value_high: number;
  specs: CameraSpecs;
  history: string;
  conditions: {
    mint: [number, number];
    excellent: [number, number];
    good: [number, number];
    'for-parts': [number, number];
  };
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function seedCameras(): SeedCamera[] {
  return [
    {
      slug: 'leica-m3',
      brand: 'Leica',
      model: 'M3',
      format: '35mm Rangefinder',
      year_start: 1954,
      year_end: 1966,
      country: 'Germany',
      mount: 'Leica M',
      rarity: 'Uncommon',
      value_low: 140000,
      value_median: 220000,
      value_high: 320000,
      specs: {
        type: '35mm rangefinder',
        mount: 'Leica M bayonet',
        shutter: 'Cloth focal-plane, 1s to 1/1000s',
        meter: 'None (handheld or accessory)',
        weight: '580g body only',
        produced: 'Approximately 226,000 units',
        notes: 'Double-stroke until 1958, single-stroke thereafter.',
      },
      history:
        'The M3 launched the M-mount system and set the template for every Leica rangefinder since. Its bright 0.91x finder, combined viewfinder/rangefinder, and bayonet mount made screw-mount Barnack bodies feel obsolete overnight. Production split between an early double-stroke advance (1954 to 1958) and the later single-stroke variant. Values track condition closely, with clean glass, working slow speeds, and matching serials commanding the top end of the range.',
      conditions: {
        mint: [260000, 320000],
        excellent: [200000, 260000],
        good: [140000, 200000],
        'for-parts': [40000, 80000],
      },
    },
    {
      slug: 'hasselblad-500cm',
      brand: 'Hasselblad',
      model: '500C/M',
      format: 'Medium Format',
      year_start: 1970,
      year_end: 1994,
      country: 'Sweden',
      mount: 'Hasselblad V',
      rarity: 'Sought-after',
      value_low: 95000,
      value_median: 150000,
      value_high: 240000,
      specs: {
        type: '6x6 medium-format SLR',
        mount: 'Hasselblad V (bayonet)',
        shutter: 'Leaf shutter in lens, 1s to 1/500s',
        weight: '1.4 kg with 80mm lens and A12 back',
        produced: 'Over 200,000 units',
        notes: 'User-changeable focusing screens differentiate it from the 500C.',
      },
      history:
        'The 500C/M refined the 1957 500C with user-replaceable focusing screens and minor reliability tweaks, then ran for nearly a quarter century. The modular V system (body, lens, finder, back) means almost everything is serviceable today. Kit pricing depends heavily on the bundled lens and back; a clean body with an 80mm f/2.8 Planar and an A12 back is the benchmark configuration.',
      conditions: {
        mint: [200000, 240000],
        excellent: [140000, 200000],
        good: [95000, 140000],
        'for-parts': [30000, 60000],
      },
    },
    {
      slug: 'canon-ae-1',
      brand: 'Canon',
      model: 'AE-1',
      format: '35mm SLR',
      year_start: 1976,
      year_end: 1984,
      country: 'Japan',
      mount: 'Canon FD',
      rarity: 'Common',
      value_low: 7000,
      value_median: 12000,
      value_high: 22000,
      specs: {
        type: '35mm SLR',
        mount: 'Canon FD breech-lock',
        shutter: 'Electronically controlled cloth focal-plane, 2s to 1/1000s',
        meter: 'Centre-weighted average, silicon photocell',
        weight: '590g body only',
        produced: 'Over 5 million units',
      },
      history:
        'The AE-1 was the first SLR with an embedded microcomputer and arguably the camera that turned the 35mm SLR into a mass-market product. Shutter priority, a bright finder, and a vast FD lens lineup made it the default first SLR for a generation. Values are held down by the sheer supply, but the famous "Canon cough" (squeaking mirror dampener) makes serviced examples worth a premium.',
      conditions: {
        mint: [18000, 22000],
        excellent: [12000, 18000],
        good: [7000, 12000],
        'for-parts': [2000, 5000],
      },
    },
    {
      slug: 'olympus-om-1',
      brand: 'Olympus',
      model: 'OM-1',
      format: '35mm SLR',
      year_start: 1972,
      year_end: 1979,
      country: 'Japan',
      mount: 'Olympus OM',
      rarity: 'Uncommon',
      value_low: 10000,
      value_median: 18000,
      value_high: 32000,
      specs: {
        type: '35mm SLR',
        mount: 'Olympus OM bayonet',
        shutter: 'Mechanical cloth focal-plane, 1s to 1/1000s',
        meter: 'CdS through-the-lens',
        weight: '510g body only',
        notes: 'Original mercury cell, replace with MR-9 adapter or zinc-air.',
      },
      history:
        'Maitani-san built the OM-1 to prove a full-frame SLR could be small and quiet. The body still feels remarkably compact against contemporaries, and the Zuiko primes are sharp, light, and cheap. Values rise sharply for serviced examples with fresh foam light seals and a functional meter (the original mercury-cell circuit is a known weak point).',
      conditions: {
        mint: [26000, 32000],
        excellent: [18000, 26000],
        good: [10000, 18000],
        'for-parts': [3000, 6000],
      },
    },
    {
      slug: 'pentax-k1000',
      brand: 'Pentax',
      model: 'K1000',
      format: '35mm SLR',
      year_start: 1976,
      year_end: 1997,
      country: 'Japan',
      mount: 'Pentax K',
      rarity: 'Common',
      value_low: 6000,
      value_median: 10000,
      value_high: 18000,
      specs: {
        type: '35mm SLR',
        mount: 'Pentax K bayonet',
        shutter: 'Mechanical cloth focal-plane, 1s to 1/1000s',
        meter: 'Centre-weighted average, needs battery only for meter',
        weight: '620g body only',
      },
      history:
        'A 21-year production run made the K1000 the default photography-school camera of the 1980s and 90s. It has no autoexposure, no self-timer on early models, and a single match-needle meter, which is exactly why it survived: nothing to go wrong. Asahi-built examples (pre-1990) are noticeably better made than the later Hong Kong and China builds.',
      conditions: {
        mint: [15000, 18000],
        excellent: [10000, 15000],
        good: [6000, 10000],
        'for-parts': [1500, 4000],
      },
    },
    {
      slug: 'nikon-f3',
      brand: 'Nikon',
      model: 'F3',
      format: '35mm SLR',
      year_start: 1980,
      year_end: 2001,
      country: 'Japan',
      mount: 'Nikon F',
      rarity: 'Uncommon',
      value_low: 18000,
      value_median: 32000,
      value_high: 60000,
      specs: {
        type: 'Professional 35mm SLR',
        mount: 'Nikon F (AI)',
        shutter: 'Electronically controlled titanium focal-plane, 8s to 1/2000s',
        meter: '80/20 centre-weighted, silicon photocell',
        weight: '715g body only',
        notes: 'HP variant has a high-eyepoint DE-3 finder.',
      },
      history:
        'Designed by Giorgetto Giugiaro and built for a 21-year run, the F3 is Nikon\'s longest-lived professional body. The titanium shutter, MD-4 motor drive option, and the bombproof brass chassis put it on every magazine shoot of the 80s. The HP variant commands a premium because the high-eyepoint finder is far more comfortable for spectacle wearers.',
      conditions: {
        mint: [50000, 60000],
        excellent: [32000, 50000],
        good: [18000, 32000],
        'for-parts': [5000, 12000],
      },
    },
    {
      slug: 'rolleiflex-28f',
      brand: 'Rolleiflex',
      model: '2.8F',
      format: 'TLR',
      year_start: 1960,
      year_end: 1981,
      country: 'Germany',
      mount: 'Fixed (Planar or Xenotar 80mm f/2.8)',
      rarity: 'Sought-after',
      value_low: 110000,
      value_median: 180000,
      value_high: 290000,
      specs: {
        type: '6x6 twin-lens reflex',
        mount: 'Fixed lens',
        shutter: 'Synchro-Compur leaf, 1s to 1/500s',
        meter: 'Selenium (later models, often dead today)',
        weight: '1.25 kg',
      },
      history:
        'The 2.8F is the last and most refined of the standard Rolleiflex line, with either a Zeiss Planar or Schneider Xenotar 80mm f/2.8 taking lens. The selenium meter is decorative on most surviving examples. Values run on lens type (Planar trades higher), serial range, and whether the original case, lens caps, and Rolleinar close-up lenses are present.',
      conditions: {
        mint: [240000, 290000],
        excellent: [180000, 240000],
        good: [110000, 180000],
        'for-parts': [35000, 70000],
      },
    },
    {
      slug: 'mamiya-rb67',
      brand: 'Mamiya',
      model: 'RB67 Pro S',
      format: 'Medium Format',
      year_start: 1974,
      year_end: 1990,
      country: 'Japan',
      mount: 'Mamiya RB',
      rarity: 'Uncommon',
      value_low: 28000,
      value_median: 48000,
      value_high: 78000,
      specs: {
        type: '6x7 medium-format SLR',
        mount: 'Mamiya RB bayonet',
        shutter: 'Leaf in lens, 1s to 1/400s',
        weight: '2.7 kg with 90mm and 120 back',
        notes: 'Rotating back is the signature feature, no need to turn the camera.',
      },
      history:
        'Studio photographers loved the RB67 because the rotating back let them switch portrait and landscape without moving the tripod. The system is mechanical (no batteries), the 6x7 negative is genuinely large, and lenses are cheap relative to Hasselblad. Examples with a 90mm f/3.8 lens and a 120 film back are the standard configuration.',
      conditions: {
        mint: [60000, 78000],
        excellent: [48000, 60000],
        good: [28000, 48000],
        'for-parts': [8000, 18000],
      },
    },
    {
      slug: 'yashica-electro-35',
      brand: 'Yashica',
      model: 'Electro 35 GSN',
      format: '35mm Rangefinder',
      year_start: 1973,
      year_end: 1977,
      country: 'Japan',
      mount: 'Fixed (Color-Yashinon DX 45mm f/1.7)',
      rarity: 'Common',
      value_low: 4500,
      value_median: 9000,
      value_high: 16000,
      specs: {
        type: 'Aperture-priority 35mm rangefinder',
        mount: 'Fixed lens',
        shutter: 'Electronic Copal leaf, 30s to 1/500s',
        meter: 'CdS, aperture-priority only',
      },
      history:
        'The Electro 35 line built a cult around the bright 45mm f/1.7 lens and a stepless 30-second long exposure. The GSN is the most common variant, often found with a corroded battery contact (the original 5.6V mercury cell needs an adapter today). A "POD" rubber bumper inside the body degrades and causes the slow-speed delay, an easy fix for techs.',
      conditions: {
        mint: [13000, 16000],
        excellent: [9000, 13000],
        good: [4500, 9000],
        'for-parts': [1500, 3500],
      },
    },
    {
      slug: 'contax-t2',
      brand: 'Contax',
      model: 'T2',
      format: '35mm Compact',
      year_start: 1990,
      year_end: 1997,
      country: 'Japan',
      mount: 'Fixed (Carl Zeiss Sonnar 38mm f/2.8 T*)',
      rarity: 'Sought-after',
      value_low: 70000,
      value_median: 110000,
      value_high: 180000,
      specs: {
        type: 'Autofocus 35mm compact',
        mount: 'Fixed lens',
        shutter: '1s to 1/500s',
        meter: 'Programmed and aperture-priority',
        weight: '295g',
      },
      history:
        'A titanium-bodied autofocus compact with a Zeiss Sonnar 38mm f/2.8, the T2 was a high-end pocket camera that found a second life on Instagram in the late 2010s. Demand from a fashion-and-music crowd pushed prices three to five times above their 2010 levels. Black and gold variants sit above the standard champagne finish.',
      conditions: {
        mint: [150000, 180000],
        excellent: [110000, 150000],
        good: [70000, 110000],
        'for-parts': [20000, 40000],
      },
    },
  ];
}

export function seedToCameraRow(seed: SeedCamera): Omit<
  Camera,
  'id' | 'view_count'
> & {
  brand_slug: string;
  format_slug: string;
  price_source: string;
  published: boolean;
  value_updated_at: string;
} {
  return {
    slug: seed.slug,
    brand: seed.brand,
    brand_slug: slugify(seed.brand),
    model: seed.model,
    format: seed.format,
    format_slug: slugify(seed.format),
    year_start: seed.year_start,
    year_end: seed.year_end,
    country: seed.country,
    mount: seed.mount,
    specs: seed.specs,
    history: seed.history,
    rarity: seed.rarity,
    hero_image_url: null,
    value_low: seed.value_low,
    value_median: seed.value_median,
    value_high: seed.value_high,
    value_updated_at: new Date().toISOString(),
    price_source: 'manual',
    published: true,
  };
}
