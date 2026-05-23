import { absoluteUrl } from '@/lib/site';
import { renderUrlSet, xmlResponse, type SitemapUrl } from '@/lib/sitemap-helpers';

// Static pages and major hubs that don't fit cleanly into the per-entity
// chunks. Updated whenever we add a top-level route.
export const revalidate = 3600;

const ROUTES: SitemapUrl[] = [
  { loc: absoluteUrl('/'), priority: 1, changefreq: 'daily' },
  { loc: absoluteUrl('/browse'), priority: 0.8, changefreq: 'daily' },
  { loc: absoluteUrl('/brand'), priority: 0.7, changefreq: 'weekly' },
  { loc: absoluteUrl('/price-index'), priority: 0.8, changefreq: 'daily' },
  { loc: absoluteUrl('/blog'), priority: 0.7, changefreq: 'daily' },
  { loc: absoluteUrl('/value-my-camera'), priority: 0.6 },
  { loc: absoluteUrl('/submit'), priority: 0.5 },
  { loc: absoluteUrl('/log-sale'), priority: 0.5 },
  { loc: absoluteUrl('/about'), priority: 0.4 },
  { loc: absoluteUrl('/how-values-work'), priority: 0.6 },
  { loc: absoluteUrl('/contact'), priority: 0.3 },
  { loc: absoluteUrl('/disclaimer'), priority: 0.3 },
  { loc: absoluteUrl('/privacy'), priority: 0.2 },
  { loc: absoluteUrl('/terms'), priority: 0.2 },
];

export async function GET() {
  return xmlResponse(renderUrlSet(ROUTES));
}
