import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { JsonLd } from '@/components/JsonLd';
import { adminDb } from '@/lib/admin';
import { SITE, absoluteUrl } from '@/lib/site';
import { breadcrumbsJsonLd } from '@/lib/schema';
import type { BlogPost } from '@/lib/blog';

interface Props {
  params: { slug: string };
}

export const revalidate = 60;

async function fetchPost(slug: string): Promise<BlogPost | null> {
  const db = adminDb();
  const { data, error } = await db
    .from('blog_posts')
    .select('*')
    .eq('site', SITE.siteKey)
    .eq('slug', slug)
    .or('published.eq.true,is_published.eq.true')
    .maybeSingle();
  if (error) {
    console.error('[blog] post query failed:', error);
    return null;
  }
  return (data as BlogPost) ?? null;
}

async function fetchRelated(post: BlogPost): Promise<BlogPost[]> {
  if (!post.category) return [];
  const db = adminDb();
  const { data } = await db
    .from('blog_posts')
    .select('id, slug, title, category, excerpt, cover_image, cover_image_alt, author_name, read_time_minutes, published_at')
    .eq('site', SITE.siteKey)
    .eq('category', post.category)
    .neq('id', post.id)
    .or('published.eq.true,is_published.eq.true')
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(4);
  return (data ?? []) as BlogPost[];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await fetchPost(params.slug);
  if (!post) return { title: 'Post not found', robots: { index: false } };
  const title = post.meta_title ?? post.seo_title ?? post.title;
  const description =
    post.meta_description ?? post.seo_description ?? post.excerpt ?? undefined;
  return {
    title,
    description: description ?? undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title,
      description: description ?? undefined,
      images: post.cover_image ? [{ url: post.cover_image }] : undefined,
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
      authors: post.author_name ? [post.author_name] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const post = await fetchPost(params.slug);
  if (!post) notFound();
  const related = await fetchRelated(post);

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: post.title, href: `/blog/${post.slug}` },
  ];

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description:
      post.meta_description ?? post.seo_description ?? post.excerpt ?? undefined,
    image: post.cover_image ?? undefined,
    datePublished: post.published_at ?? post.created_at,
    dateModified: post.updated_at,
    author: {
      '@type': 'Person',
      name: post.author_name ?? SITE.founder,
      url: absoluteUrl('/about'),
    },
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      url: SITE.url,
    },
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
  };

  return (
    <>
      <JsonLd data={[articleJsonLd, breadcrumbsJsonLd(breadcrumbs)]} />
      <article className="max-w-[760px] mx-auto px-7 py-10">
        <Breadcrumbs items={breadcrumbs} />
        <header className="mt-6 mb-8">
          {post.category ? (
            <p className="text-[12.5px] font-bold tracking-[0.12em] text-blue uppercase mb-3">
              {post.category}
            </p>
          ) : null}
          <h1 className="font-head text-[clamp(36px,5vw,60px)] font-bold tracking-[-0.03em] leading-[1.05] text-navy">
            {post.title}
          </h1>
          {post.excerpt ? (
            <p className="text-[18px] text-slate leading-relaxed mt-4">
              {post.excerpt}
            </p>
          ) : null}
          <p className="text-sm text-slate mt-5">
            By {post.author_name ?? SITE.founder}
            {post.published_at ? (
              <>
                {' '}
                ·{' '}
                <time dateTime={post.published_at}>
                  {new Date(post.published_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </time>
              </>
            ) : null}
            {post.read_time_minutes
              ? ` · ${post.read_time_minutes} min read`
              : ''}
          </p>
        </header>

        {post.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover_image}
            alt={post.cover_image_alt ?? post.title}
            className="w-full rounded-card mb-10"
          />
        ) : null}

        <div
          className="prose prose-cg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content ?? '' }}
        />

        <AuthorCard name={post.author_name ?? SITE.founder} />

        {related.length > 0 ? (
          <section className="mt-14">
            <h2 className="font-head text-2xl font-bold text-navy mb-5">
              Keep reading
            </h2>
            <ul className="bg-white border border-line rounded-card divide-y divide-line">
              {related.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/blog/${r.slug}`}
                    className="flex justify-between gap-4 px-5 py-4 hover:bg-paper"
                  >
                    <div>
                      <p className="font-semibold text-navy">{r.title}</p>
                      {r.excerpt ? (
                        <p className="text-sm text-slate mt-1 line-clamp-1">
                          {r.excerpt}
                        </p>
                      ) : null}
                    </div>
                    <span className="text-slate shrink-0 self-center">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </article>
    </>
  );
}

function AuthorCard({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase();
  return (
    <aside className="mt-12 bg-paper border border-line rounded-card p-6 flex items-start gap-4">
      <div className="w-12 h-12 rounded-full bg-navy text-white font-head font-bold flex items-center justify-center text-lg shrink-0">
        {initial}
      </div>
      <div>
        <p className="font-head text-lg font-bold text-navy">{name}</p>
        <p className="text-sm text-slate mt-1">
          Editor at CameraGrail. We catalogue every camera ever made and write
          honestly about what they are worth, what they shoot like, and which
          ones are worth your money.
        </p>
      </div>
    </aside>
  );
}
