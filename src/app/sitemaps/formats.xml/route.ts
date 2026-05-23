import { listFormats } from '@/lib/catalogue';
import { absoluteUrl } from '@/lib/site';
import { renderUrlSet, xmlResponse, type SitemapUrl } from '@/lib/sitemap-helpers';

export const revalidate = 3600;

export async function GET() {
  let formats: Awaited<ReturnType<typeof listFormats>> = [];
  try {
    formats = await listFormats();
  } catch (err) {
    console.error('[sitemap:formats]', err);
  }
  const urls: SitemapUrl[] = formats.map((f) => ({
    loc: absoluteUrl(`/format/${f.format_slug}`),
    priority: 0.7,
    changefreq: 'weekly',
  }));
  return xmlResponse(renderUrlSet(urls));
}
