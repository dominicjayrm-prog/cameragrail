import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { JsonLd } from '@/components/JsonLd';
import { adminDb } from '@/lib/admin';
import { SITE } from '@/lib/site';
import { breadcrumbsJsonLd, collectionPageJsonLd } from '@/lib/schema';
import type { BlogPost } from '@/lib/blog';

// IMPORTANT: do not ISR the index. The shared CMS pattern across the
// founder's projects has bitten them with stale empty states from a 10-min
// cache; force-dynamic is the deliberate default. Cached versions can come
// later behind a CDN we control.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'CameraGrail Blog: Camera buying guides and collector notes',
  description:
    'Buying guides, value explainers, and collector notes from the CameraGrail editors. Long-form pieces about cameras, lenses, and the market.',
  alternates: { canonical: '/blog' },
};

export default async function BlogIndex() {
  const db = adminDb();
  const { data, error } = await db
    .from('blog_posts')
    .select('*')
    .eq('site', SITE.siteKey)
    .or('published.eq.true,is_published.eq.true')
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(60);

  if (error) {
    // Surface the error in the server log AND on the page so production
    // misconfigurations can be diagnosed without redeploying.
    console.error('[blog] index query failed:', error);
  }

  const posts = (data ?? []) as BlogPost[];
  const featured = posts.find((p) => p.is_featured);
  const rest = posts.filter((p) => p.id !== featured?.id);

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' },
  ];

  return (
    <>
      <JsonLd
        data={[
          collectionPageJsonLd(
            'CameraGrail Blog',
            'Buying guides, value explainers, and collector notes.',
            '/blog',
          ),
          breadcrumbsJsonLd(breadcrumbs),
        ]}
      />
      <div className="max-w-page mx-auto px-7 py-10">
        <Breadcrumbs items={breadcrumbs} />
        <header className="mt-6 mb-10">
          <p className="text-[12.5px] font-bold tracking-[0.12em] text-blue uppercase mb-2">
            CameraGrail Journal
          </p>
          <h1 className="font-head text-[clamp(36px,5vw,60px)] font-bold tracking-[-0.03em] leading-[1.05] text-navy">
            Buying guides and collector notes
          </h1>
          <p className="text-[17px] text-slate mt-3 max-w-[760px]">
            Long-form pieces from the editors. How values move, what to buy,
            and the corners of the camera world worth paying attention to.
          </p>
        </header>

        {posts.length === 0 ? (
          <EmptyState error={error?.message ?? null} />
        ) : (
          <>
            {featured ? <FeaturedCard post={featured} /> : null}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
              {rest.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

function EmptyState({ error }: { error: string | null }) {
  return (
    <div className="bg-white border border-line rounded-card p-10 text-center">
      <p className="font-head text-xl font-bold text-navy mb-2">
        Nothing published yet.
      </p>
      <p className="text-slate">First piece lands soon. Check back shortly.</p>
      {error ? (
        <p className="mt-6 text-[11px] text-slate/70 font-mono">
          Diagnostic: {error}
        </p>
      ) : null}
    </div>
  );
}

function FeaturedCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="cardh block bg-white border border-line rounded-card overflow-hidden md:grid md:grid-cols-2"
    >
      {post.cover_image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.cover_image}
          alt={post.cover_image_alt ?? post.title}
          className="w-full h-full object-cover aspect-[16/10] md:aspect-auto"
        />
      ) : (
        <div className="bg-navy/5 aspect-[16/10] md:aspect-auto" />
      )}
      <div className="p-8 flex flex-col justify-center">
        <span className="text-[11px] uppercase tracking-[0.1em] font-bold text-blue mb-3">
          Featured · {post.category ?? 'Editorial'}
        </span>
        <h2 className="font-head text-2xl md:text-3xl font-bold tracking-[-0.02em] leading-[1.15] text-navy mb-3">
          {post.title}
        </h2>
        {post.excerpt ? (
          <p className="text-slate leading-relaxed text-[15px] mb-4">
            {post.excerpt}
          </p>
        ) : null}
        <p className="text-xs text-slate">
          {post.author_name ?? 'CameraGrail Editors'}
          {post.read_time_minutes
            ? ` · ${post.read_time_minutes} min read`
            : ''}
        </p>
      </div>
    </Link>
  );
}

function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="cardh block bg-white border border-line rounded-card overflow-hidden"
    >
      {post.cover_image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.cover_image}
          alt={post.cover_image_alt ?? post.title}
          className="w-full aspect-[16/10] object-cover"
        />
      ) : (
        <div className="bg-navy/5 aspect-[16/10]" />
      )}
      <div className="p-6">
        {post.category ? (
          <span className="text-[11px] uppercase tracking-[0.1em] font-bold text-blue mb-2 inline-block">
            {post.category}
          </span>
        ) : null}
        <h3 className="font-head text-xl font-bold tracking-[-0.015em] leading-[1.2] text-navy mb-2">
          {post.title}
        </h3>
        {post.excerpt ? (
          <p className="text-slate text-[14.5px] leading-relaxed line-clamp-3">
            {post.excerpt}
          </p>
        ) : null}
        <p className="text-xs text-slate mt-4">
          {post.author_name ?? 'CameraGrail Editors'}
          {post.read_time_minutes
            ? ` · ${post.read_time_minutes} min read`
            : ''}
        </p>
      </div>
    </Link>
  );
}
