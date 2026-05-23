import { adminDb } from '@/lib/admin';
import { absoluteUrl, SITE } from '@/lib/site';
import { renderUrlSet, xmlResponse, type SitemapUrl } from '@/lib/sitemap-helpers';
import type { BlogPost } from '@/lib/blog';

export const revalidate = 3600;

export async function GET() {
  let rows: Pick<BlogPost, 'slug' | 'updated_at' | 'published_at'>[] = [];
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const db = adminDb();
      const { data } = await db
        .from('blog_posts')
        .select('slug, updated_at, published_at')
        .eq('site', SITE.siteKey)
        .or('published.eq.true,is_published.eq.true')
        .order('published_at', { ascending: false })
        .limit(45000);
      rows = (data ?? []) as typeof rows;
    } catch (err) {
      console.error('[sitemap:blog]', err);
    }
  }
  const urls: SitemapUrl[] = rows.map((p) => ({
    loc: absoluteUrl(`/blog/${p.slug}`),
    priority: 0.7,
    changefreq: 'weekly',
    lastmod: p.updated_at ?? undefined,
  }));
  return xmlResponse(renderUrlSet(urls));
}
