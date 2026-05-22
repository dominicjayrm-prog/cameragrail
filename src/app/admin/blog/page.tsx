import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { adminDb, requireAdmin } from '@/lib/admin';
import { SITE } from '@/lib/site';
import type { BlogPost } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function BlogAdminIndex() {
  await requireAdmin();
  const db = adminDb();
  const { data, error } = await db
    .from('blog_posts')
    .select(
      'id, slug, title, category, status, is_featured, published_at, updated_at',
    )
    .eq('site', SITE.siteKey)
    .order('updated_at', { ascending: false })
    .limit(200);

  const posts = (data ?? []) as BlogPost[];

  return (
    <div className="max-w-page mx-auto px-7 py-10">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Admin', href: '/admin/blog' },
          { label: 'Blog', href: '/admin/blog' },
        ]}
      />
      <header className="mt-6 mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[12.5px] font-bold tracking-[0.12em] text-blue uppercase mb-2">
            Admin
          </p>
          <h1 className="font-head text-[clamp(32px,4vw,52px)] font-bold tracking-[-0.025em] text-navy">
            Blog posts
          </h1>
          <p className="text-slate mt-2">
            {posts.length} {posts.length === 1 ? 'post' : 'posts'} on{' '}
            <code className="text-xs">{SITE.siteKey}</code>.
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="btn-primary px-5 py-2.5 rounded-[10px] font-semibold text-sm"
        >
          + New post
        </Link>
      </header>

      {error ? (
        <div className="rounded-card border border-down/30 bg-down/5 text-down p-4 text-sm mb-4">
          Diagnostic: {error.message}
        </div>
      ) : null}

      {posts.length === 0 ? (
        <div className="bg-white border border-line rounded-card p-10 text-center text-slate">
          No posts yet. Start writing.
        </div>
      ) : (
        <ul className="bg-white border border-line rounded-card divide-y divide-line">
          {posts.map((p) => (
            <li
              key={p.id}
              className="grid grid-cols-[1fr_auto_auto] gap-4 items-center px-5 py-4"
            >
              <div>
                <Link
                  href={`/admin/blog/${p.id}`}
                  className="font-semibold text-navy hover:underline"
                >
                  {p.title || 'Untitled'}
                </Link>
                <p className="text-xs text-slate mt-1">
                  /blog/{p.slug}
                  {p.category ? ` · ${p.category}` : ''} · Updated{' '}
                  {new Date(p.updated_at).toLocaleDateString('en-GB', {
                    dateStyle: 'medium',
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {p.is_featured ? (
                  <span className="text-[10px] uppercase tracking-[0.1em] font-bold px-2 py-1 rounded-pill bg-blue/10 text-blue">
                    Featured
                  </span>
                ) : null}
                <StatusBadge status={p.status} />
              </div>
              <Link
                href={`/admin/blog/${p.id}`}
                className="text-sm text-navy lu font-semibold"
              >
                Edit →
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const m: Record<string, { label: string; cls: string }> = {
    draft: { label: 'Draft', cls: 'bg-paper text-slate border border-line' },
    published: { label: 'Published', cls: 'bg-success/10 text-success' },
  };
  const v = m[status] ?? m.draft;
  return (
    <span
      className={`text-[10px] uppercase tracking-[0.1em] font-bold px-2 py-1 rounded-pill ${v.cls}`}
    >
      {v.label}
    </span>
  );
}
