import { NextRequest, NextResponse } from 'next/server';
import { validatePassword, signToken, cookieOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (!validatePassword(password)) {
    return NextResponse.json({ error: 'סיסמה שגויה' }, { status: 401 });
  }

  const token = await signToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set({ ...cookieOptions(), value: token });
  return response;
}
