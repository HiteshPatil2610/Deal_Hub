import * as cheerio from 'cheerio';

export type SourceSite = 'amazon' | 'flipkart';

export interface ScrapedProduct {
  name: string;
  description: string;
  image_url: string;
  price: string;
  currency: string;
  source_site: string;
}

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-IN,en;q=0.9',
};

/**
 * Fetches a product page (following affiliate redirects) and parses it
 * with the site-specific extractor.
 */
export async function scrapeProduct(
  url: string,
  site: SourceSite
): Promise<ScrapedProduct> {
  const res = await fetch(url, {
    headers: BROWSER_HEADERS,
    redirect: 'follow',
  });

  if (!res.ok) {
    throw new Error(
      `Failed to load the product page (status ${res.status}). The site may be blocking automated requests.`
    );
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  return site === 'amazon' ? parseAmazon($) : parseFlipkart($);
}

function metaContent($: cheerio.CheerioAPI, prop: string): string {
  return (
    $(`meta[property="${prop}"]`).attr('content') ||
    $(`meta[name="${prop}"]`).attr('content') ||
    ''
  ).trim();
}

function cleanText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function extractNumericPrice(raw: string): string {
  const match = raw.replace(/,/g, '').match(/\d+(\.\d+)?/);
  return match ? match[0] : '';
}

function firstMatch(
  $: cheerio.CheerioAPI,
  selectors: string[],
  attr?: string
): string {
  for (const sel of selectors) {
    const el = $(sel).first();
    const val = attr ? el.attr(attr) : el.text();
    if (val && val.trim()) return val.trim();
  }
  return '';
}

function firstListMatch($: cheerio.CheerioAPI, selectors: string[]): string[] {
  for (const sel of selectors) {
    const items: string[] = [];
    $(sel).each((_, el) => {
      const t = cleanText($(el).text());
      if (t) items.push(t);
    });
    if (items.length) return items;
  }
  return [];
}

// ---------------- Amazon ----------------

function parseAmazon($: cheerio.CheerioAPI): ScrapedProduct {
  const name =
    cleanText($('#productTitle').text()) || cleanText(metaContent($, 'og:title'));

  const image_url =
    $('#landingImage').attr('data-old-hires') ||
    $('#landingImage').attr('src') ||
    firstMatch($, ['#imgTagWrapperId img'], 'src') ||
    metaContent($, 'og:image');

  const rawPrice = firstMatch($, [
    '#corePrice_feature_div .a-price .a-offscreen',
    '#corePriceDisplay_desktop_feature_div .a-price .a-offscreen',
    '#priceblock_ourprice',
    '#priceblock_dealprice',
    '.a-price .a-offscreen',
  ]);
  const price = extractNumericPrice(rawPrice);

  const bullets = firstListMatch($, ['#feature-bullets ul li span.a-list-item']);
  const description = bullets.length
    ? bullets.map((b) => `• ${b}`).join('\n')
    : cleanText(metaContent($, 'og:description'));

  return {
    name,
    description,
    image_url,
    price,
    currency: 'INR',
    source_site: 'Amazon',
  };
}

// ---------------- Flipkart ----------------

function parseFlipkart($: cheerio.CheerioAPI): ScrapedProduct {
  const name =
    firstMatch($, ['span.VU-ZEz', 'span.B_NuCI', 'h1 span']) ||
    cleanText(metaContent($, 'og:title'));

  const image_url =
    firstMatch(
      $,
      ['img._53J4C-', 'img._396cs4', 'img._2r_T1I', 'img.DByuf4'],
      'src'
    ) || metaContent($, 'og:image');

  const rawPrice = firstMatch($, [
    'div.Nx9bqj.CxhGGd',
    'div._30jeq3._16Jk6d',
    'div._30jeq3',
  ]);
  const price = extractNumericPrice(rawPrice);

  const bullets = firstListMatch($, [
    'div._1mXcCf.RmoJUa li',
    'div._2418kt li',
    'ul._1xgFaf li',
  ]);
  const description = bullets.length
    ? bullets.map((b) => `• ${b}`).join('\n')
    : cleanText(metaContent($, 'og:description'));

  return {
    name,
    description,
    image_url,
    price,
    currency: 'INR',
    source_site: 'Flipkart',
  };
}
