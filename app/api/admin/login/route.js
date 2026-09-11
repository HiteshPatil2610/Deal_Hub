import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { signSession, COOKIE_NAME } from '@/lib/auth';

export async function POST(req) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
  }

  const { rows } = await query('SELECT * FROM admin_users WHERE username = $1', [username]);
  const user = rows[0];

  if (!user) {
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
  }

  const token = signSession({ role: 'admin', username: user.username, uid: user.id });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  });
  return res;
}
