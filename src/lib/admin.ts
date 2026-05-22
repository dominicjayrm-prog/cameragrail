// Admin auth and database helpers for the blog CMS and moderation queue.
//
// `requireAdmin` is the gate on every admin route. `adminDb` returns a
// service-role client that bypasses RLS for admin writes and for public
// reads where we need predictable behaviour (Supabase env mismatches have
// silently broken anon reads in the past; service-role removes that risk
// and the data is public anyway).
import 'server-only';
import { redirect } from 'next/navigation';
import { getCurrentUser, isAdminEmail } from './supabase/ssr';
import { supabaseService } from './supabase/server';
import { supabaseAnon } from './supabase/server';

export { isAdminEmail };

export async function requireAdmin(nextPath = '/admin/blog') {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  if (!isAdminEmail(user.email)) redirect('/login?error=not_authorised');
  return user;
}

export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return isAdminEmail(user?.email);
}

// Service-role client. Falls back to the anon client only when the service
// role env var is absent (local dev without the key set). The fallback path
// will fail any write attempt with an RLS error, surfaced visibly in the
// admin UI, which is the desired feedback.
export function adminDb() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return supabaseService();
  }
  return supabaseAnon();
}
