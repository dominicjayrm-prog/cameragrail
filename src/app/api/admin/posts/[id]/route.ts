import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { adminDb, isAdminEmail } from '@/lib/admin';
import { getCurrentUser } from '@/lib/supabase/ssr';
import { SITE } from '@/lib/site';

interface Params {
  params: { id: string };
}

async function gate() {
  const user = await getCurrentUser();
  if (!isAdminEmail(user?.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  return null;
}

export async function PATCH(request: Request, { params }: Params) {
  const denied = await gate();
  if (denied) return denied;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const db = adminDb();
  const { data: existing, error: fetchError } = await db
    .from('blog_posts')
    .select('id, slug, status, published_at')
    .eq('id', params.id)
    .eq('site', SITE.siteKey)
    .maybeSingle();
  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const nowIso = new Date().toISOString();
  const status = body.status === 'published' ? 'published' : 'draft';
  // Preserve original publish timestamp if it already exists; set on first publish.
  const publishedAt =
    status === 'published'
      ? (existing as { published_at: string | null }).published_at ?? nowIso
      : null;

  const update: Record<string, unknown> = {
    slug: body.slug ?? existing.slug,
    title: body.title,
    category: body.category ?? null,
    excerpt: body.excerpt ?? null,
    content: body.content ?? null,
    cover_image: body.cover_image ?? null,
    cover_image_alt: body.cover_image_alt ?? null,
    meta_title: body.meta_title ?? null,
    meta_description: body.meta_description ?? null,
    seo_title: body.meta_title ?? null,
    seo_description: body.meta_description ?? null,
    author_name: body.author_name ?? null,
    read_time_minutes: body.read_time_minutes ?? null,
    tags: Array.isArray(body.tags) ? body.tags : null,
    is_featured: !!body.is_featured,
    status,
    is_published: status === 'published',
    published: status === 'published',
    published_at: publishedAt,
    updated_at: nowIso,
  };

  const { error } = await db
    .from('blog_posts')
    .update(update)
    .eq('id', params.id);

  if (error) {
    console.error('[posts] update failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath('/blog');
  revalidatePath(`/blog/${existing.slug}`);
  if (update.slug && update.slug !== existing.slug) {
    revalidatePath(`/blog/${update.slug as string}`);
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Params) {
  const denied = await gate();
  if (denied) return denied;

  const db = adminDb();
  const { data: existing } = await db
    .from('blog_posts')
    .select('slug')
    .eq('id', params.id)
    .eq('site', SITE.siteKey)
    .maybeSingle();

  const { error } = await db
    .from('blog_posts')
    .delete()
    .eq('id', params.id)
    .eq('site', SITE.siteKey);
  if (error) {
    console.error('[posts] delete failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath('/blog');
  if (existing?.slug) revalidatePath(`/blog/${existing.slug}`);
  return NextResponse.json({ ok: true });
}
