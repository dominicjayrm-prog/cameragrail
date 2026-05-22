'use client';

import { useEffect, useMemo, useState } from 'react';
import { wordCount } from '@/lib/blog';

export interface ScannerInput {
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  coverImage: string;
  coverImageAlt: string;
  contentHtml: string;
}

type Status = 'pass' | 'warn' | 'fail';

interface Check {
  id: string;
  label: string;
  rule: string;
  status: Status;
  detail: string;
}

interface Props {
  input: ScannerInput;
}

export function SeoScanner({ input }: Props) {
  // Debounce so we are not running 11 checks on every keystroke.
  const [debounced, setDebounced] = useState(input);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(input), 300);
    return () => clearTimeout(t);
  }, [input]);

  const checks = useMemo(() => runChecks(debounced), [debounced]);
  const score = computeScore(checks);
  const tone = score >= 85 ? 'success' : score >= 60 ? 'warn' : 'fail';

  return (
    <aside className="bg-white border border-line rounded-card p-5 sticky top-24">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="font-head text-base font-bold text-navy">SEO scan</h3>
        <p
          className={`font-head text-2xl font-bold tabular-nums ${
            tone === 'success'
              ? 'text-success'
              : tone === 'warn'
                ? 'text-[#B6791C]'
                : 'text-down'
          }`}
          title="Aggregate of all checks below"
        >
          {score}
          <span className="text-slate text-sm font-medium">/100</span>
        </p>
      </div>
      <ul className="space-y-3">
        {checks.map((c) => (
          <li key={c.id} className="flex items-start gap-3">
            <Dot status={c.status} />
            <div className="text-sm">
              <p className="font-semibold text-ink">{c.label}</p>
              <p className="text-xs text-slate mt-0.5">{c.rule}</p>
              <p
                className={`text-xs mt-0.5 ${
                  c.status === 'pass'
                    ? 'text-success'
                    : c.status === 'warn'
                      ? 'text-[#B6791C]'
                      : 'text-down'
                }`}
              >
                {c.detail}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function Dot({ status }: { status: Status }) {
  const className =
    status === 'pass'
      ? 'bg-success'
      : status === 'warn'
        ? 'bg-[#E3B23A]'
        : 'bg-down';
  return (
    <span
      aria-hidden
      className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${className}`}
    />
  );
}

function runChecks(input: ScannerInput): Check[] {
  const checks: Check[] = [];
  const html = input.contentHtml ?? '';

  // 1. Meta title length.
  const mt = input.metaTitle.length;
  checks.push({
    id: 'meta_title',
    label: 'Meta title length',
    rule: '50 to 60 characters; warn 40 to 65; fail outside',
    status: mt >= 50 && mt <= 60 ? 'pass' : mt >= 40 && mt <= 65 ? 'warn' : 'fail',
    detail: `${mt} chars`,
  });

  // 2. Meta description length.
  const md = input.metaDescription.length;
  checks.push({
    id: 'meta_description',
    label: 'Meta description length',
    rule: '120 to 155 characters; warn 100 to 170',
    status:
      md >= 120 && md <= 155 ? 'pass' : md >= 100 && md <= 170 ? 'warn' : 'fail',
    detail: `${md} chars`,
  });

  // 3. Slug shape.
  const slug = input.slug;
  const slugValid = /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug);
  checks.push({
    id: 'slug',
    label: 'Slug shape',
    rule: 'Lowercase letters, digits, and single hyphens',
    status: slugValid ? 'pass' : slug ? 'fail' : 'warn',
    detail: slug || 'empty',
  });

  // 4. Cover image + alt text.
  checks.push({
    id: 'cover',
    label: 'Cover image and alt text',
    rule: 'Both must be set',
    status:
      input.coverImage && input.coverImageAlt
        ? 'pass'
        : input.coverImage || input.coverImageAlt
          ? 'warn'
          : 'fail',
    detail: input.coverImage
      ? input.coverImageAlt
        ? 'image and alt present'
        : 'alt text missing'
      : 'cover image missing',
  });

  // 5. Word count.
  const wc = wordCount(html);
  checks.push({
    id: 'word_count',
    label: 'Word count',
    rule: '400 minimum; 800 plus for cornerstone',
    status: wc >= 800 ? 'pass' : wc >= 400 ? 'warn' : 'fail',
    detail: `${wc} words`,
  });

  // 6. H1 count (warn on any in body since the title is the page H1).
  const h1Count = (html.match(/<h1[\s>]/gi) ?? []).length;
  checks.push({
    id: 'h1',
    label: 'Body H1 count',
    rule: 'No H1 in body; the page title is already H1',
    status: h1Count === 0 ? 'pass' : 'warn',
    detail: `${h1Count} body H1${h1Count === 1 ? '' : 's'} found`,
  });

  // 7. H2 count.
  const h2Count = (html.match(/<h2[\s>]/gi) ?? []).length;
  checks.push({
    id: 'h2',
    label: 'H2 section count',
    rule: 'At least 3 H2 sections to structure the piece',
    status: h2Count >= 3 ? 'pass' : h2Count >= 1 ? 'warn' : 'fail',
    detail: `${h2Count} H2${h2Count === 1 ? '' : 's'}`,
  });

  // 8. Internal links.
  const internal = (html.match(/href=["']\/[^"']*["']/g) ?? []).length;
  checks.push({
    id: 'internal',
    label: 'Internal links',
    rule: 'At least 2 links to other pages on this site',
    status: internal >= 2 ? 'pass' : internal === 1 ? 'warn' : 'fail',
    detail: `${internal} internal link${internal === 1 ? '' : 's'}`,
  });

  // 9. External links count (informational).
  const external = (html.match(/href=["']https?:[^"']+["']/g) ?? []).length;
  checks.push({
    id: 'external',
    label: 'External links',
    rule: 'Awareness; mix outbound references with internal links',
    status: external >= 1 ? 'pass' : 'warn',
    detail: `${external} external link${external === 1 ? '' : 's'}`,
  });

  // 10. rel="nofollow" present on at least one external link.
  const hasNofollow = /<a [^>]*href=["']https?:[^"']+["'][^>]*rel=["'][^"']*nofollow/i.test(
    html,
  );
  checks.push({
    id: 'nofollow',
    label: 'nofollow on external links',
    rule: 'External links should carry rel="nofollow"',
    status: external === 0 ? 'pass' : hasNofollow ? 'pass' : 'fail',
    detail:
      external === 0
        ? 'no external links to flag'
        : hasNofollow
          ? 'at least one external link is nofollow'
          : 'no external link carries nofollow',
  });

  // 11. Title vs slug word overlap.
  const titleWords = tokens(input.title);
  const slugWords = tokens(input.slug.replace(/-/g, ' '));
  const overlap = titleWords.length
    ? slugWords.filter((w) => titleWords.includes(w)).length / titleWords.length
    : 0;
  checks.push({
    id: 'overlap',
    label: 'Title and slug overlap',
    rule: 'At least 50% of title words present in the slug',
    status: overlap >= 0.5 ? 'pass' : overlap >= 0.3 ? 'warn' : 'fail',
    detail: `${Math.round(overlap * 100)}% overlap`,
  });

  return checks;
}

function computeScore(checks: Check[]): number {
  const weight = { pass: 1, warn: 0.5, fail: 0 } as const;
  const total = checks.reduce((s, c) => s + weight[c.status], 0);
  return Math.round((total / checks.length) * 100);
}

function tokens(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}
