import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(req) {
  const admin = requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [{ rows: totals }, { rows: topProducts }, { rows: recentClicks }, { rows: dailyClicks }] =
    await Promise.all([
      query(`
        SELECT
          (SELECT COUNT(*) FROM products) AS total_products,
          (SELECT COUNT(*) FROM products WHERE is_active = true) AS active_products,
          (SELECT COUNT(*) FROM clicks) AS total_clicks,
          (SELECT COUNT(*) FROM clicks WHERE clicked_at > now() - interval '24 hours') AS clicks_today
      `),
      query(`
        SELECT p.id, p.name, p.slug, p.image_url, COUNT(c.id) AS click_count
        FROM products p
        LEFT JOIN clicks c ON c.product_id = p.id
        GROUP BY p.id
        ORDER BY click_count DESC
        LIMIT 8
      `),
      query(`
        SELECT c.id, c.clicked_at, p.name AS product_name
        FROM clicks c
        JOIN products p ON p.id = c.product_id
        ORDER BY c.clicked_at DESC
        LIMIT 15
      `),
      query(`
        SELECT date_trunc('day', clicked_at) AS day, COUNT(*) AS count
        FROM clicks
        WHERE clicked_at > now() - interval '14 days'
        GROUP BY day
        ORDER BY day ASC
      `)
    ]);

  return NextResponse.json({
    totals: totals[0],
    topProducts,
    recentClicks,
    dailyClicks
  });
}
