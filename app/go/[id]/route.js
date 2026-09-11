import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  const { rows } = await query(
    'SELECT id, affiliate_url FROM products WHERE id = $1 AND is_active = true',
    [id]
  );
  const product = rows[0];

  if (!product) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  try {
    await query(
      'INSERT INTO clicks (product_id, referrer, user_agent) VALUES ($1, $2, $3)',
      [id, req.headers.get('referer') || null, req.headers.get('user-agent') || null]
    );
  } catch (e) {
    // Never block the redirect just because logging failed
    console.error('Failed to log click', e);
  }

  return NextResponse.redirect(product.affiliate_url, { status: 302 });
}
