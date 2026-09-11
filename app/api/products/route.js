import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { slugify } from '@/lib/slugify';

export async function GET(req) {
  const admin = requireAdmin(req);
  // Admins get all products (including inactive), public only gets active ones
  const { rows } = await query(
    `SELECT p.*, c.name as category_name
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE ($1::boolean OR p.is_active = true)
     ORDER BY p.created_at DESC`,
    [!!admin]
  );
  return NextResponse.json({ products: rows });
}

export async function POST(req) {
  const admin = requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { name, description, image_url, price, currency, source_site, affiliate_url, category_id, featured } = body;

  if (!name || !affiliate_url) {
    return NextResponse.json({ error: 'Name and affiliate URL are required' }, { status: 400 });
  }

  let slug = slugify(name);
  const existing = await query('SELECT id FROM products WHERE slug = $1', [slug]);
  if (existing.rows.length > 0) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const { rows } = await query(
    `INSERT INTO products
      (name, slug, description, image_url, price, currency, source_site, affiliate_url, category_id, featured)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING *`,
    [
      name,
      slug,
      description || null,
      image_url || null,
      price || null,
      currency || 'INR',
      source_site || 'Amazon',
      affiliate_url,
      category_id || null,
      !!featured
    ]
  );

  return NextResponse.json({ product: rows[0] }, { status: 201 });
}
