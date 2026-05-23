import { listBrands } from '@/lib/catalogue';
import { absoluteUrl } from '@/lib/site';
import { renderUrlSet, xmlResponse, type SitemapUrl } from '@/lib/sitemap-helpers';

export const revalidate = 3600;

export async function GET() {
  let brands: Awaited<ReturnType<typeof listBrands>> = [];
  try {
    brands = await listBrands();
  } catch (err) {
    console.error('[sitemap:brands]', err);
  }
  const urls: SitemapUrl[] = brands.map((b) => ({
    loc: absoluteUrl(`/brand/${b.brand_slug}`),
    priority: 0.7,
    changefreq: 'weekly',
  }));
  return xmlResponse(renderUrlSet(urls));
}
