export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}

export function absoluteUrl(path: string): string {
  const base = siteUrl().replace(/\/$/, '');
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${base}${clean}`;
}

export const SITE_NAME = 'CameraGrail';
export const SITE_TAGLINE = 'Camera Values, Specs, and Price History';
export const VALUE_DISCLAIMER =
  'Values are estimates based on real sale data and are not formal appraisals.';
