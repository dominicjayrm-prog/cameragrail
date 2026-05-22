import type { MetadataRoute } from 'next';
import { listBrands, listCameras, listFormats } from '@/lib/catalogue';
import { absoluteUrl } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cameras, brands, formats] = await Promise.all([
    listCameras({ limit: 5000 }),
    listBrands(),
    listFormats(),
  ]);

  const STATIC: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), priority: 1, changeFrequency: 'daily' },
    { url: absoluteUrl('/browse'), priority: 0.8, changeFrequency: 'daily' },
    { url: absoluteUrl('/brand'), priority: 0.7, changeFrequency: 'weekly' },
    { url: absoluteUrl('/price-index'), priority: 0.8, changeFrequency: 'daily' },
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

  return [...STATIC, ...cameraUrls, ...brandUrls, ...formatUrls];
}
