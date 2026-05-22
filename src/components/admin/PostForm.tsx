'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Editor } from './Editor';
import { SeoScanner } from './SeoScanner';
import { wordCount, estimateReadTime } from '@/lib/blog';
import { slugify } from '@/lib/slug';

export interface PostFormValues {
  id?: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  cover_image: string;
  cover_image_alt: string;
  meta_title: string;
  meta_description: string;
  author_name: string;
  read_time_minutes: number;
  tags: string;
  is_featured: boolean;
  status: 'draft' | 'published';
}

interface Props {
  mode: 'create' | 'edit';
  initial: PostFormValues;
  defaultAuthor: string;
  categories: string[];
}

export function PostForm({ mode, initial, defaultAuthor, categories }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<PostFormValues>({
    ...initial,
    author_name: initial.author_name || defaultAuthor,
  });
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(
    mode === 'edit' && !!initial.slug,
  );
  const [readTimeManuallyEdited, setReadTimeManuallyEdited] = useState(
    mode === 'edit' && !!initial.read_time_minutes,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Auto-derive slug from title until the editor touches it manually.
  useEffect(() => {
    if (slugManuallyEdited) return;
    const next = slugify(values.title);
    if (next && next !== values.slug) {
      setValues((v) => ({ ...v, slug: next }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.title]);

  // Auto-derive read time from content until the editor touches it manually.
  useEffect(() => {
    if (readTimeManuallyEdited) return;
    const next = estimateReadTime(values.content);
    if (next && next !== values.read_time_minutes) {
      setValues((v) => ({ ...v, read_time_minutes: next }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.content]);

  const wc = useMemo(() => wordCount(values.content), [values.content]);

  async function save(nextStatus: 'draft' | 'published') {
    setSaving(true);
    setError(null);
    setSuccess(null);
    const payload = {
      slug: values.slug,
      title: values.title,
      category: values.category || null,
      excerpt: values.excerpt || null,
      content: values.content,
      cover_image: values.cover_image || null,
      cover_image_alt: values.cover_image_alt || null,
      meta_title: values.meta_title || null,
      meta_description: values.meta_description || null,
      author_name: values.author_name || null,
      read_time_minutes: values.read_time_minutes || null,
      tags: values.tags
        ? values.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : null,
      is_featured: values.is_featured,
      status: nextStatus,
    };
    try {
      const url =
        mode === 'edit'
          ? `/api/admin/posts/${values.id}`
          : '/api/admin/posts';
      const method = mode === 'edit' ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Save failed');
        return;
      }
      setSuccess(
        nextStatus === 'published' ? 'Published.' : 'Saved as draft.',
      );
      if (mode === 'create' && data.id) {
        router.push(`/admin/blog/${data.id}`);
      } else {
        router.refresh();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  }

  async function destroy() {
    if (mode !== 'edit') return;
    if (!confirm('Delete this post permanently?')) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/posts/${values.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Delete failed');
        return;
      }
      router.push('/admin/blog');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-8">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save(values.status);
        }}
        className="space-y-6"
      >
        {error ? (
          <div className="rounded-card border border-down/30 bg-down/5 text-down p-4 text-sm">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="rounded-card border border-success/30 bg-success/5 text-success p-4 text-sm">
            {success}
          </div>
        ) : null}

        <Field
          label="Title"
          required
          value={values.title}
          onChange={(v) => setValues((s) => ({ ...s, title: v }))}
          placeholder="Why the Leica M3 still defines the rangefinder"
        />

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Field
              label="Slug"
              required
              value={values.slug}
              onChange={(v) => {
                setSlugManuallyEdited(true);
                setValues((s) => ({ ...s, slug: slugify(v) }));
              }}
              hint="Lowercase, hyphenated. URL: /blog/<slug>"
            />
          </div>
          <div>
            <label className="block">
              <span className="text-xs uppercase tracking-[0.08em] text-slate font-semibold mb-1.5 block">
                Category
              </span>
              <input
                type="text"
                list="cg-categories"
                value={values.category}
                onChange={(e) =>
                  setValues((s) => ({ ...s, category: e.target.value }))
                }
                className="w-full bg-white border border-line rounded-[10px] px-4 py-2.5 outline-none focus:border-blue"
                placeholder="Buying guide"
              />
              <datalist id="cg-categories">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </label>
          </div>
        </div>

        <Textarea
          label="Excerpt"
          value={values.excerpt}
          onChange={(v) => setValues((s) => ({ ...s, excerpt: v }))}
          rows={3}
          placeholder="One or two sentences that appear on the index and in social previews."
        />

        <div>
          <span className="text-xs uppercase tracking-[0.08em] text-slate font-semibold mb-1.5 block">
            Content <span className="text-down">*</span>
          </span>
          <Editor
            value={values.content}
            onChange={(html) =>
              setValues((s) => ({ ...s, content: html }))
            }
            placeholder="Write the piece. Use H2 for sections, link generously to other camera pages."
          />
          <p className="text-xs text-slate mt-1.5">{wc} words</p>
        </div>

        <fieldset className="border border-line rounded-card p-5">
          <legend className="text-xs uppercase tracking-[0.08em] text-slate font-semibold px-2">
            SEO
          </legend>
          <div className="space-y-4">
            <FieldWithCount
              label="Meta title"
              value={values.meta_title}
              onChange={(v) =>
                setValues((s) => ({ ...s, meta_title: v }))
              }
              target={[50, 60]}
              hint="Falls back to the title if empty."
            />
            <FieldWithCount
              label="Meta description"
              multiline
              value={values.meta_description}
              onChange={(v) =>
                setValues((s) => ({ ...s, meta_description: v }))
              }
              target={[120, 155]}
            />
          </div>
        </fieldset>

        <fieldset className="border border-line rounded-card p-5">
          <legend className="text-xs uppercase tracking-[0.08em] text-slate font-semibold px-2">
            Cover image
          </legend>
          <div className="grid md:grid-cols-2 gap-4">
            <Field
              label="Image URL"
              value={values.cover_image}
              onChange={(v) =>
                setValues((s) => ({ ...s, cover_image: v }))
              }
              placeholder="https://..."
            />
            <Field
              label="Alt text"
              value={values.cover_image_alt}
              onChange={(v) =>
                setValues((s) => ({ ...s, cover_image_alt: v }))
              }
              placeholder="Describe the image"
            />
          </div>
          {values.cover_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={values.cover_image}
              alt={values.cover_image_alt || 'Cover preview'}
              className="mt-4 rounded-[10px] border border-line max-h-64 object-cover"
            />
          ) : null}
        </fieldset>

        <fieldset className="border border-line rounded-card p-5">
          <legend className="text-xs uppercase tracking-[0.08em] text-slate font-semibold px-2">
            Meta
          </legend>
          <div className="grid md:grid-cols-3 gap-4">
            <Field
              label="Author"
              value={values.author_name}
              onChange={(v) =>
                setValues((s) => ({ ...s, author_name: v }))
              }
            />
            <label className="block">
              <span className="text-xs uppercase tracking-[0.08em] text-slate font-semibold mb-1.5 block">
                Read time (min)
              </span>
              <input
                type="number"
                min={1}
                value={values.read_time_minutes}
                onChange={(e) => {
                  setReadTimeManuallyEdited(true);
                  setValues((s) => ({
                    ...s,
                    read_time_minutes: Number(e.target.value) || 0,
                  }));
                }}
                className="w-full bg-white border border-line rounded-[10px] px-4 py-2.5 outline-none focus:border-blue"
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-[0.08em] text-slate font-semibold mb-1.5 block">
                Featured
              </span>
              <select
                value={values.is_featured ? 'yes' : 'no'}
                onChange={(e) =>
                  setValues((s) => ({
                    ...s,
                    is_featured: e.target.value === 'yes',
                  }))
                }
                className="w-full bg-white border border-line rounded-[10px] px-4 py-2.5 outline-none focus:border-blue"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </label>
          </div>
          <div className="mt-4">
            <Field
              label="Tags (comma-separated)"
              value={values.tags}
              onChange={(v) => setValues((s) => ({ ...s, tags: v }))}
              placeholder="leica, rangefinder, buying guide"
            />
          </div>
        </fieldset>

        <div className="flex flex-wrap gap-3 items-center sticky bottom-0 bg-paper py-4 border-t border-line">
          <button
            type="button"
            onClick={() => save('draft')}
            disabled={saving}
            className="px-5 py-2.5 rounded-[10px] border border-line bg-white text-ink font-semibold hover:bg-paper disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save draft'}
          </button>
          <button
            type="button"
            onClick={() => save('published')}
            disabled={saving || !values.title || !values.slug}
            className="btn-primary px-5 py-2.5 rounded-[10px] font-semibold disabled:opacity-50"
          >
            {values.status === 'published' ? 'Update published' : 'Publish'}
          </button>
          {mode === 'edit' ? (
            <button
              type="button"
              onClick={destroy}
              disabled={saving}
              className="ml-auto text-sm text-down hover:underline disabled:opacity-50"
            >
              Delete post
            </button>
          ) : null}
        </div>
      </form>

      <SeoScanner
        input={{
          title: values.title,
          slug: values.slug,
          metaTitle: values.meta_title || values.title,
          metaDescription: values.meta_description,
          coverImage: values.cover_image,
          coverImageAlt: values.cover_image_alt,
          contentHtml: values.content,
        }}
      />
    </div>
  );
}

function Field({
  label,
  required,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.08em] text-slate font-semibold mb-1.5 block">
        {label}
        {required ? <span className="text-down ml-1">*</span> : null}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full bg-white border border-line rounded-[10px] px-4 py-2.5 outline-none focus:border-blue"
      />
      {hint ? <p className="text-xs text-slate mt-1">{hint}</p> : null}
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
  rows,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.08em] text-slate font-semibold mb-1.5 block">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full bg-white border border-line rounded-[10px] px-4 py-2.5 outline-none focus:border-blue leading-[1.55]"
      />
    </label>
  );
}

function FieldWithCount({
  label,
  value,
  onChange,
  target,
  multiline,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  target: [number, number];
  multiline?: boolean;
  hint?: string;
}) {
  const [lo, hi] = target;
  const len = value.length;
  const tone =
    len >= lo && len <= hi
      ? 'text-success'
      : len >= lo - 10 && len <= hi + 10
        ? 'text-[#B6791C]'
        : 'text-down';
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.08em] text-slate font-semibold mb-1.5 flex justify-between">
        <span>{label}</span>
        <span className={`${tone} font-mono normal-case tracking-normal`}>
          {len} / {lo}–{hi}
        </span>
      </span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full bg-white border border-line rounded-[10px] px-4 py-2.5 outline-none focus:border-blue leading-[1.55]"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white border border-line rounded-[10px] px-4 py-2.5 outline-none focus:border-blue"
        />
      )}
      {hint ? <p className="text-xs text-slate mt-1">{hint}</p> : null}
    </label>
  );
}
