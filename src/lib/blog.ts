import { SITE } from './site';

export interface BlogPost {
  id: string;
  site: string;
  slug: string;
  title: string;
  category: string | null;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  cover_image_alt: string | null;
  featured_image: string | null;
  meta_title: string | null;
  meta_description: string | null;
  seo_title: string | null;
  seo_description: string | null;
  author_name: string | null;
  read_time_minutes: number | null;
  status: 'draft' | 'published';
  is_published: boolean;
  published: boolean;
  is_featured: boolean;
  tags: string[] | null;
  language: string | null;
  published_at: string | null;
  updated_at: string;
  created_at: string;
}

export type BlogPostInput = Partial<Omit<BlogPost, 'id' | 'site' | 'created_at' | 'updated_at'>>;

// Word count from an HTML body (TipTap output). Strips tags, splits on
// whitespace. Used for read-time autocalc and the SEO scanner.
export function wordCount(html: string): number {
  if (!html) return 0;
  const text = html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&[a-z]+;/gi, ' ');
  return text.split(/\s+/).filter(Boolean).length;
}

export function estimateReadTime(html: string): number {
  return Math.max(1, Math.round(wordCount(html) / 200));
}

export function blogPostSite(): string {
  return SITE.siteKey;
}
