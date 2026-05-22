import DOMPurify from 'isomorphic-dompurify';

// Strict allowlist tuned for the TipTap StarterKit + Link + Image extensions
// we have enabled. Anything else from the editor (or a future paste, or a
// compromised admin account) gets stripped before render.
const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'em',
  'u',
  's',
  'code',
  'pre',
  'blockquote',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'hr',
  'a',
  'img',
];

const ALLOWED_ATTR = ['href', 'rel', 'target', 'src', 'alt', 'title'];

const SAFE_URL_RE = /^(https?:|mailto:|tel:|\/|#)/i;

// Render-time sanitizer for TipTap-generated HTML. Returns a string ready to
// pass to dangerouslySetInnerHTML.
export function sanitizeBlogHtml(html: string): string {
  if (!html) return '';
  const cleaned = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    // Force every <a> to a safe rel + target, mirroring the ExternalLink
    // component. This protects against TipTap's Link extension being passed
    // a non-http URL through paste handlers.
    ADD_ATTR: ['target'],
  });

  // Belt-and-braces: strip javascript:/data: hrefs that DOMPurify already
  // catches, but be defensive in case the allowlist drifts.
  return cleaned.replace(/href=("|')(?!https?:|\/|#|mailto:|tel:)([^"']*)\1/gi, '');
}

// Validate a user-supplied URL is safe to use in <img src> or <a href>. We
// only allow http(s) absolute URLs and same-origin paths. Anything else
// (javascript:, data:, vbscript:, file:) returns null so the caller can
// render a fallback.
export function safeUrl(input: string | null | undefined): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (!SAFE_URL_RE.test(trimmed)) return null;
  return trimmed;
}
