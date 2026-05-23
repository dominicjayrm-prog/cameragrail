import { listCameras } from '@/lib/catalogue';
import { absoluteUrl } from '@/lib/site';
import { renderUrlSet, xmlResponse, type SitemapUrl } from '@/lib/sitemap-helpers';

// All published cameras. Capped at 45,000 to stay safely below the 50,000
// sitemap limit; once the catalogue grows past that we'll add /sitemaps/
// cameras/[page]/route.ts to paginate.
export const revalidate = 3600;

export async function GET() {
  let cameras: Awaited<ReturnType<typeof listCameras>> = [];
  try {
    cameras = await listCameras({ limit: 45000 });
  } catch (err) {
    console.error('[sitemap:cameras]', err);
  }

  const urls: SitemapUrl[] = cameras.map((c) => ({
    loc: absoluteUrl(
      `/camera/${c.brand_slug}/${c.slug.replace(`${c.brand_slug}-`, '')}`,
    ),
    priority: 0.8,
    changefreq: 'weekly',
    lastmod: c.value_updated_at ?? undefined,
  }));

  return xmlResponse(renderUrlSet(urls));
}
