import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { PostForm } from '@/components/admin/PostForm';
import { adminDb, requireAdmin } from '@/lib/admin';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'New blog post',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function NewPostPage() {
  await requireAdmin('/admin/blog/new');
  const categories = await fetchCategories();
  return (
    <div className="max-w-page mx-auto px-7 py-10">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Admin', href: '/admin/blog' },
          { label: 'Blog', href: '/admin/blog' },
          { label: 'New post', href: '/admin/blog/new' },
        ]}
      />
      <header className="mt-6 mb-8">
        <h1 className="font-head text-[clamp(32px,4vw,52px)] font-bold tracking-[-0.025em] text-navy">
          New post
        </h1>
      </header>
      <PostForm
        mode="create"
        defaultAuthor={SITE.founder}
        categories={categories}
        initial={{
          slug: '',
          title: '',
          category: '',
          excerpt: '',
          content: '',
          cover_image: '',
          cover_image_alt: '',
          meta_title: '',
          meta_description: '',
          author_name: SITE.founder,
          read_time_minutes: 0,
          tags: '',
          is_featured: false,
          status: 'draft',
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
