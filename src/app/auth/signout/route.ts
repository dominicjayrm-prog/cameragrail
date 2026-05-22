import { NextResponse, type NextRequest } from 'next/server';
import { supabaseServerClient } from '@/lib/supabase/ssr';

export async function POST(request: NextRequest) {
  const supabase = supabaseServerClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/', request.url), 303);
}
