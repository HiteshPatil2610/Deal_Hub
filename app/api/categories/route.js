import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { slugify } from '@/lib/slugify';

export async function GET() {
  const { rows } = await query('SELECT * FROM categories ORDER BY name ASC');
  return NextResponse.json({ categories: rows });
}

export async function POST(req) {
  const admin = requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { name } = await req.json();
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

  const slug = slugify(name);
  const { rows } = await query(
    `INSERT INTO categories (name, slug) VALUES ($1,$2)
     ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
     RETURNING *`,
    [name, slug]
  );
  return NextResponse.json({ category: rows[0] }, { status: 201 });
}
