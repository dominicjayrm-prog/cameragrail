import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

type CookieToSet = { name: string; value: string; options?: CookieOptions };

const SCHEMA = 'cameragrail';

// Read-only Supabase client for Server Components. The cookie store is
// read here but writes happen in middleware (which has a mutable response).
// Calls to setAll inside a Server Component are swallowed because Next does
// not allow setting cookies during render; that is fine because the
// middleware handles refresh on every request.
export function supabaseServerClient() {
  const cookieStore = cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Missing Supabase env vars for SSR client');
  }
  return createServerClient(url, key, {
    db: { schema: SCHEMA },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(toSet: CookieToSet[]) {
        try {
          toSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Components cannot set cookies; ignore.
        }
      },
    },
  });
}

// Returns the current authenticated user or null. Use this in Server
// Components and Server Actions to gate behaviour.
export async function getCurrentUser() {
  const supabase = supabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user ?? null;
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const list = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}
