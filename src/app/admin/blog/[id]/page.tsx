import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { PostForm } from '@/components/admin/PostForm';
import { adminDb, requireAdmin } from '@/lib/admin';
import { SITE } from '@/lib/site';
import type { BlogPost } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Edit blog post',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

interface Props {
  params: { id: string };
}

export default async function EditPostPage({ params }: Props) {
  await requireAdmin(`/admin/blog/${params.id}`);
  const db = adminDb();
  const { data: post, error } = await db
    .from('blog_posts')
    .select('*')
    .eq('id', params.id)
    .eq('site', SITE.siteKey)
    .maybeSingle();
  if (error || !post) notFound();

  const categories = await fetchCategories();
  const p = post as BlogPost;

  return (
    <div className="max-w-page mx-auto px-7 py-10">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Admin', href: '/admin/blog' },
          { label: 'Blog', href: '/admin/blog' },
          { label: p.title || 'Edit', href: `/admin/blog/${p.id}` },
        ]}
      />
      <header className="mt-6 mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-head text-[clamp(28px,3.5vw,44px)] font-bold tracking-[-0.025em] text-navy">
            {p.title || 'Untitled post'}
          </h1>
          <p className="text-slate mt-2 text-sm">
            <a className="lu text-navy font-semibold" href={`/blog/${p.slug}`}>
              View public page →
            </a>
          </p>
        </div>
      </header>
      <PostForm
        mode="edit"
        defaultAuthor={SITE.founder}
        categories={categories}
        initial={{
          id: p.id,
          slug: p.slug,
          title: p.title,
          category: p.category ?? '',
          excerpt: p.excerpt ?? '',
          content: p.content ?? '',
          cover_image: p.cover_image ?? '',
          cover_image_alt: p.cover_image_alt ?? '',
          meta_title: p.meta_title ?? '',
          meta_description: p.meta_description ?? '',
          author_name: p.author_name ?? SITE.founder,
          read_time_minutes: p.read_time_minutes ?? 0,
          tags: (p.tags ?? []).join(', '),
          is_featured: p.is_featured,
          status: p.status,
        }}
      />
    </div>
  );
}

async function fetchCategories(): Promise<string[]> {
  const db = adminDb();
  const { data } = await db
    .from('blog_posts')
    .select('category')
    .eq('site', SITE.siteKey)
    .not('category', 'is', null);
  const set = new Set<string>();
  for (const row of (data ?? []) as Array<{ category: string }>) {
    if (row.category) set.add(row.category);
  }
  return [...set].sort();
}
