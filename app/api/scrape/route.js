import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { scrapeProduct } from '@/scraper';

export const runtime = 'nodejs';

export async function POST(req) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'A product URL is required.' }, { status: 400 });
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: 'That is not a valid URL.' }, { status: 400 });
    }

    if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
      return NextResponse.json({ error: 'Only HTTP and HTTPS URLs are supported.' }, { status: 400 });
    }

    const host = parsedUrl.hostname.toLowerCase();
    const isAmazon = host.includes('amazon.') || host === 'amzn.to' || host === 'amzn.in';
    const isFlipkart = host === 'flipkart.com' || host.endsWith('.flipkart.com') || host === 'fkrt.it' || host === 'fkrt.co';

    if (!isAmazon && !isFlipkart) {
      return NextResponse.json(
        { error: 'Only Amazon and Flipkart URLs are supported right now.' },
        { status: 400 }
      );
    }

    const product = await scrapeProduct(url, isAmazon ? 'amazon' : 'flipkart');
    return NextResponse.json(product);
  } catch (error) {
    console.error('Scrape error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch product details.' },
      { status: 500 }
    );
  }
}