// Shared helpers for the sitemap index + per-type chunk routes.
import { absoluteUrl } from './site';

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

function escape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function renderUrlSet(urls: SitemapUrl[]): string {
  const body = urls
    .map((u) => {
      const parts = [`<loc>${escape(u.loc)}</loc>`];
      if (u.lastmod) parts.push(`<lastmod>${u.lastmod}</lastmod>`);
      if (u.changefreq) parts.push(`<changefreq>${u.changefreq}</changefreq>`);
      if (u.priority != null) parts.push(`<priority>${u.priority.toFixed(1)}</priority>`);
      return `  <url>${parts.join('')}</url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`;
}

export function renderSitemapIndex(sitemaps: Array<{ loc: string; lastmod?: string }>): string {
  const body = sitemaps
    .map(
      (s) =>
        `  <sitemap><loc>${escape(s.loc)}</loc>${
          s.lastmod ? `<lastmod>${s.lastmod}</lastmod>` : ''
        }</sitemap>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</sitemapindex>`;
}

export function xmlResponse(body: string): Response {
  return new Response(body, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      // 1 hour edge cache so we don't slam Supabase on every Googlebot hit
      'cache-control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

export const SITEMAP_TYPES = ['static', 'cameras', 'brands', 'formats', 'blog'] as const;
export type SitemapType = (typeof SITEMAP_TYPES)[number];

export function sitemapChildUrl(type: SitemapType): string {
  return absoluteUrl(`/sitemaps/${type}.xml`);
}
