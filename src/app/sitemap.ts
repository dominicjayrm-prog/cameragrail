import type { MetadataRoute } from 'next';
import { listBrands, listCameras, listFormats } from '@/lib/catalogue';
import { absoluteUrl, SITE } from '@/lib/site';
import { adminDb } from '@/lib/admin';
import type { BlogPost } from '@/lib/blog';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cameras, brands, formats, blogResult] = await Promise.all([
    listCameras({ limit: 5000 }),
    listBrands(),
    listFormats(),
    fetchBlogSlugs(),
  ]);

  const STATIC: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), priority: 1, changeFrequency: 'daily' },
    { url: absoluteUrl('/browse'), priority: 0.8, changeFrequency: 'daily' },
    { url: absoluteUrl('/brand'), priority: 0.7, changeFrequency: 'weekly' },
    { url: absoluteUrl('/price-index'), priority: 0.8, changeFrequency: 'daily' },
    { url: absoluteUrl('/blog'), priority: 0.7, changeFrequency: 'daily' },
    { url: absoluteUrl('/about'), priority: 0.4 },
    { url: absoluteUrl('/how-values-work'), priority: 0.6 },
    { url: absoluteUrl('/submit'), priority: 0.5 },
    { url: absoluteUrl('/log-sale'), priority: 0.5 },
    { url: absoluteUrl('/value-my-camera'), priority: 0.6 },
    { url: absoluteUrl('/contact'), priority: 0.3 },
    { url: absoluteUrl('/disclaimer'), priority: 0.2 },
    { url: absoluteUrl('/privacy'), priority: 0.2 },
    { url: absoluteUrl('/terms'), priority: 0.2 },
  ];

  const cameraUrls: MetadataRoute.Sitemap = cameras.map((c) => ({
    url: absoluteUrl(
      `/camera/${c.brand_slug}/${c.slug.replace(`${c.brand_slug}-`, '')}`,
    ),
    priority: 0.9,
    changeFrequency: 'weekly',
    lastModified: c.value_updated_at ? new Date(c.value_updated_at) : undefined,
  }));

  const brandUrls: MetadataRoute.Sitemap = brands.map((b) => ({
    url: absoluteUrl(`/brand/${b.brand_slug}`),
    priority: 0.7,
    changeFrequency: 'weekly',
  }));

  const formatUrls: MetadataRoute.Sitemap = formats.map((f) => ({
    url: absoluteUrl(`/format/${f.format_slug}`),
    priority: 0.7,
    changeFrequency: 'weekly',
  }));

  const blogUrls: MetadataRoute.Sitemap = blogResult.map((p) => ({
    url: absoluteUrl(`/blog/${p.slug}`),
    priority: 0.7,
    changeFrequency: 'weekly',
    lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
  }));

  return [...STATIC, ...cameraUrls, ...brandUrls, ...formatUrls, ...blogUrls];
}

// Reads published blog slugs for the sitemap. Returns [] if Supabase is not
// configured (build environments without env vars) so the sitemap still
// generates with the rest of the URLs intact.
async function fetchBlogSlugs(): Promise<
  Pick<BlogPost, 'slug' | 'updated_at' | 'published_at'>[]
> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [];
  }
  try {
    const db = adminDb();
    const { data } = await db
      .from('blog_posts')
      .select('slug, updated_at, published_at')
      .eq('site', SITE.siteKey)
      .or('published.eq.true,is_published.eq.true')
      .order('published_at', { ascending: false })
      .limit(1000);
    return (data ?? []) as Pick<BlogPost, 'slug' | 'updated_at' | 'published_at'>[];
  } catch (err) {
    console.error('[sitemap] blog fetch failed:', err);
    return [];
  }
}
