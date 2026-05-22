// eBay integration. Abstracts the price source behind one interface so we
// can run on mock data today and swap in real Browse / Marketplace Insights
// credentials later without touching the rest of the app.
//
// Set EBAY_USE_MOCK=true (the default) to use deterministic mock data.
// Set EBAY_USE_MOCK=false and provide EBAY_APP_ID + EBAY_OAUTH_TOKEN to hit
// the real Browse API. Marketplace Insights (sold data) lives behind a
// further EBAY_MARKETPLACE_INSIGHTS_ENABLED flag because it needs approval.

export interface ActiveListing {
  itemId: string;
  title: string;
  pricePence: number;
  currency: 'GBP';
  url: string;
  imageUrl: string | null;
  condition: string | null;
  sellerLocation: string | null;
}

export interface SoldListing {
  itemId: string;
  title: string;
  pricePence: number;
  currency: 'GBP';
  soldDate: string;
  condition: string | null;
}

export interface PriceQuote {
  low: number;
  median: number;
  high: number;
  sampleSize: number;
  source: 'ebay_browse' | 'ebay_insights' | 'mock';
}

function shouldUseMock(): boolean {
  if (process.env.EBAY_USE_MOCK === 'false') return false;
  if (!process.env.EBAY_APP_ID || !process.env.EBAY_OAUTH_TOKEN) return true;
  return process.env.EBAY_USE_MOCK !== 'false';
}

// Append eBay Partner Network campaign tags to any item URL.
export function buildAffiliateUrl(itemUrl: string): string {
  const campaign = process.env.EPN_CAMPAIGN_ID;
  if (!campaign) return itemUrl;
  try {
    const url = new URL(itemUrl);
    url.searchParams.set('mkcid', '1');
    url.searchParams.set('mkrid', '710-53481-19255-0');
    url.searchParams.set('siteid', '3');
    url.searchParams.set('campid', campaign);
    url.searchParams.set('toolid', '10001');
    url.searchParams.set('mkevt', '1');
    return url.toString();
  } catch {
    return itemUrl;
  }
}

// Build a search URL for a camera model. Used by the "see current listings"
// CTA so users land on a pre-filtered eBay search even when we don't have a
// specific item to deep-link.
export function buildSearchUrl(query: string): string {
  const base = 'https://www.ebay.co.uk/sch/i.html';
  const params = new URLSearchParams({ _nkw: query, _sop: '12' });
  return buildAffiliateUrl(`${base}?${params.toString()}`);
}

export async function getActiveListings(query: string): Promise<ActiveListing[]> {
  if (shouldUseMock()) return mockActive(query);
  return browseActiveListings(query);
}

export async function getSoldListings(query: string): Promise<SoldListing[]> {
  if (shouldUseMock()) return mockSold(query);
  if (process.env.EBAY_MARKETPLACE_INSIGHTS_ENABLED !== 'true') return [];
  return insightsSoldListings(query);
}

// Compute a condition-adjusted price quote from a list of sold prices.
// Strips obvious outliers (>3x median or <1/3 median) before computing
// low/median/high as the 20th/50th/80th percentiles.
export function quoteFromSales(sales: SoldListing[]): PriceQuote | null {
  if (sales.length === 0) return null;
  const prices = sales.map((s) => s.pricePence).sort((a, b) => a - b);
  const median = prices[Math.floor(prices.length / 2)];
  const filtered = prices.filter((p) => p >= median / 3 && p <= median * 3);
  if (filtered.length === 0) return null;
  return {
    low: percentile(filtered, 0.2),
    median: percentile(filtered, 0.5),
    high: percentile(filtered, 0.8),
    sampleSize: filtered.length,
    source: 'ebay_insights',
  };
}

function percentile(sorted: number[], p: number): number {
  const idx = Math.min(sorted.length - 1, Math.floor(sorted.length * p));
  return sorted[idx];
}

// --- Real implementations (left as TODOs, behind shouldUseMock()) ---

async function browseActiveListings(query: string): Promise<ActiveListing[]> {
  const token = process.env.EBAY_OAUTH_TOKEN;
  if (!token) return [];
  const url = new URL('https://api.ebay.com/buy/browse/v1/item_summary/search');
  url.searchParams.set('q', query);
  url.searchParams.set('limit', '20');
  url.searchParams.set('filter', 'buyingOptions:{FIXED_PRICE|AUCTION},priceCurrency:GBP');
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-EBAY-C-MARKETPLACE-ID': 'EBAY_GB',
    },
    next: { revalidate: 60 * 60 },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { itemSummaries?: EbayBrowseItem[] };
  return (data.itemSummaries ?? []).map(mapBrowseItem);
}

interface EbayBrowseItem {
  itemId: string;
  title: string;
  price?: { value: string; currency: string };
  itemWebUrl: string;
  image?: { imageUrl: string };
  condition?: string;
  itemLocation?: { country?: string };
}

function mapBrowseItem(item: EbayBrowseItem): ActiveListing {
  return {
    itemId: item.itemId,
    title: item.title,
    pricePence: Math.round(parseFloat(item.price?.value ?? '0') * 100),
    currency: 'GBP',
    url: buildAffiliateUrl(item.itemWebUrl),
    imageUrl: item.image?.imageUrl ?? null,
    condition: item.condition ?? null,
    sellerLocation: item.itemLocation?.country ?? null,
  };
}

async function insightsSoldListings(_query: string): Promise<SoldListing[]> {
  // Marketplace Insights requires application approval. Wire up here once
  // approved. Until then, callers fall back to community-submitted sales.
  return [];
}

// --- Deterministic mock data so the catalogue renders in development. ---

function mockActive(query: string): ActiveListing[] {
  const seed = stringSeed(query);
  return Array.from({ length: 6 }, (_, i) => {
    const base = 5000 + ((seed + i * 137) % 90000);
    return {
      itemId: `mock-${seed}-${i}`,
      title: `${query} (mock listing ${i + 1})`,
      pricePence: base,
      currency: 'GBP' as const,
      url: buildSearchUrl(query),
      imageUrl: null,
      condition: ['Used', 'Excellent', 'Good', 'For parts'][i % 4],
      sellerLocation: 'GB',
    };
  });
}

function mockSold(query: string): SoldListing[] {
  const seed = stringSeed(query);
  const today = new Date();
  return Array.from({ length: 14 }, (_, i) => {
    const base = 6000 + ((seed + i * 211) % 80000);
    const date = new Date(today);
    date.setDate(date.getDate() - i * 14);
    return {
      itemId: `mock-sold-${seed}-${i}`,
      title: `${query} (mock sold ${i + 1})`,
      pricePence: base,
      currency: 'GBP' as const,
      soldDate: date.toISOString().slice(0, 10),
      condition: ['Used', 'Excellent', 'Good', 'For parts'][i % 4],
    };
  });
}

function stringSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}
