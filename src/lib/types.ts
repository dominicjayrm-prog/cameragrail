export type Rarity = 'Common' | 'Uncommon' | 'Sought-after' | 'Rare';

export type Condition = 'mint' | 'excellent' | 'good' | 'for-parts';

export interface CameraSpecs {
  type?: string;
  format?: string;
  mount?: string;
  lens?: string;
  shutter?: string;
  meter?: string;
  weight?: string;
  dimensions?: string;
  produced?: string;
  notes?: string;
  [key: string]: string | number | undefined;
}

export interface Camera {
  id: string;
  slug: string;
  brand: string;
  brand_slug: string;
  model: string;
  format: string;
  format_slug: string;
  year_start: number | null;
  year_end: number | null;
  country: string | null;
  mount: string | null;
  specs: CameraSpecs | null;
  history: string | null;
  rarity: Rarity | null;
  hero_image_url: string | null;
  value_low: number | null;
  value_median: number | null;
  value_high: number | null;
  value_updated_at: string | null;
  price_source: string;
  published: boolean;
  view_count: number;
}

export interface ConditionValue {
  camera_id: string;
  condition: Condition;
  value_low: number | null;
  value_high: number | null;
}

export interface PriceHistoryPoint {
  recorded_at: string;
  median_value: number | null;
  sample_size: number | null;
}

export interface SoldListing {
  id: string;
  camera_id: string;
  source: string;
  sale_price: number | null;
  currency: string;
  condition_note: string | null;
  sold_date: string | null;
  external_url: string | null;
}
