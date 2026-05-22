import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { adminDb, isAdminEmail } from '@/lib/admin';
import { getCurrentUser } from '@/lib/supabase/ssr';
import { SITE } from '@/lib/site';
import { slugify } from '@/lib/slug';

function safeHttpUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return /^https?:\/\//i.test(trimmed) ? trimmed : null;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!isAdminEmail(user?.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const title = String(body.title ?? '').trim();
  let slug = String(body.slug ?? '').trim();
  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }
  if (!slug) slug = slugify(title);

  const status = body.status === 'published' ? 'published' : 'draft';
  const nowIso = new Date().toISOString();
  const publishedAt = status === 'published' ? nowIso : null;

  const db = adminDb();
  const insertPayload = {
    site: SITE.siteKey,
    slug,
    title,
    category: body.category ?? null,
    excerpt: body.excerpt ?? null,
    content: body.content ?? null,
    cover_image: safeHttpUrl(body.cover_image),
    cover_image_alt: body.cover_image_alt ?? null,
    meta_title: body.meta_title ?? null,
    meta_description: body.meta_description ?? null,
    seo_title: body.meta_title ?? null,
    seo_description: body.meta_description ?? null,
    author_name: body.author_name ?? SITE.founder,
    read_time_minutes: body.read_time_minutes ?? null,
    tags: Array.isArray(body.tags) ? body.tags : null,
    is_featured: !!body.is_featured,
    status,
    is_published: status === 'published',
    published: status === 'published',
    published_at: publishedAt,
    updated_at: nowIso,
  };

  const { data, error } = await db
    .from('blog_posts')
    .insert(insertPayload)
    .select('id, slug')
    .single();

  if (error) {
    console.error('[posts] insert failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath('/blog');
  revalidatePath(`/blog/${data.slug}`);
  return NextResponse.json({ ok: true, id: data.id, slug: data.slug });
}
