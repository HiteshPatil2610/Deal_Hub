import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';

export async function POST(req) {
  const { username, password, setupKey } = await req.json();

  if (!process.env.SETUP_KEY || setupKey !== process.env.SETUP_KEY) {
    return NextResponse.json({ error: 'Invalid setup key' }, { status: 403 });
  }

  const existing = await query('SELECT id FROM admin_users LIMIT 1');
  if (existing.rows.length > 0) {
    return NextResponse.json(
      { error: 'An admin account already exists. Setup is disabled.' },
      { status: 403 }
    );
  }

  if (!username || !password || password.length < 8) {
    return NextResponse.json(
      { error: 'Username and a password of at least 8 characters are required' },
      { status: 400 }
    );
  }

  const hash = await bcrypt.hash(password, 10);
  await query('INSERT INTO admin_users (username, password_hash) VALUES ($1,$2)', [
    username,
    hash
  ]);

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const existing = await query('SELECT id FROM admin_users LIMIT 1');
  return NextResponse.json({ setupComplete: existing.rows.length > 0 });
}
