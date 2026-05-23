import {
  renderSitemapIndex,
  sitemapChildUrl,
  SITEMAP_TYPES,
  xmlResponse,
} from '@/lib/sitemap-helpers';

// Sitemap index. Lists the per-type chunk sitemaps so Google can fan out
// without hitting one giant file. Each chunk caps well under the 50,000-URL
// limit and refreshes independently as content moves.
export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function GET() {
  const now = new Date().toISOString();
  const body = renderSitemapIndex(
    SITEMAP_TYPES.map((type) => ({ loc: sitemapChildUrl(type), lastmod: now })),
  );
  return xmlResponse(body);
}
