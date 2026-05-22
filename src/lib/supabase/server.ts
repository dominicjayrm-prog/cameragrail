import { createClient } from '@supabase/supabase-js';

// All CameraGrail tables live in the `cameragrail` schema so they stay
// isolated from anything else in this Supabase project.
const SCHEMA = 'cameragrail';

type CameraGrailClient = ReturnType<typeof makeClient>;
let anonClient: CameraGrailClient | null = null;
let serviceClient: CameraGrailClient | null = null;

function makeClient(url: string, key: string) {
  return createClient(url, key, {
    db: { schema: SCHEMA },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function supabaseAnon(): CameraGrailClient {
  if (anonClient) return anonClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY',
    );
  }
  anonClient = makeClient(url, key);
  return anonClient;
}

// Server-only. Bypasses RLS. Use for cron jobs, moderation, seed scripts.
export function supabaseService(): CameraGrailClient {
  if (serviceClient) return serviceClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY for server operations');
  }
  serviceClient = makeClient(url, key);
  return serviceClient;
}
