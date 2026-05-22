import { NextResponse } from 'next/server';
import { CURRENCY_COOKIE, isCurrency } from '@/lib/currency';

export async function POST(request: Request) {
  const form = await request.formData();
  const value = form.get('currency');
  const next = form.get('next');
  if (!isCurrency(value)) {
    return NextResponse.json({ error: 'invalid currency' }, { status: 400 });
  }
  const redirectTo = typeof next === 'string' && next.startsWith('/') ? next : '/';
  const response = NextResponse.redirect(new URL(redirectTo, request.url), 303);
  response.cookies.set(CURRENCY_COOKIE, value, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });
  return response;
}
