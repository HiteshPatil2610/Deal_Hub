import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(req, { params }) {
  const admin = requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { rows } = await query('SELECT * FROM products WHERE id = $1', [params.id]);
  if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ product: rows[0] });
}

export async function PUT(req, { params }) {
  const admin = requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const {
    name,
    description,
    image_url,
    price,
    currency,
    source_site,
    affiliate_url,
    category_id,
    featured,
    is_active
  } = body;

  const { rows } = await query(
    `UPDATE products SET
      name = $1,
      description = $2,
      image_url = $3,
      price = $4,
      currency = $5,
      source_site = $6,
      affiliate_url = $7,
      category_id = $8,
      featured = $9,
      is_active = $10,
      updated_at = now()
     WHERE id = $11
     RETURNING *`,
    [
      name,
      description || null,
      image_url || null,
      price || null,
      currency || 'INR',
      source_site || 'Amazon',
      affiliate_url,
      category_id || null,
      !!featured,
      is_active !== false,
      params.id
    ]
  );

  if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ product: rows[0] });
}

export async function DELETE(req, { params }) {
  const admin = requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await query('DELETE FROM products WHERE id = $1', [params.id]);
  return NextResponse.json({ ok: true });
}
