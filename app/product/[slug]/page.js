import { query } from '@/lib/db';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

async function getProduct(slug) {
  const { rows } = await query(
    `SELECT p.*, c.name as category_name
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.slug = $1 AND p.is_active = true`,
    [slug]
  );
  return rows[0] || null;
}

function formatPrice(price, currency) {
  if (price === null || price === undefined) return null;
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '\u20ac' : '\u20b9';
  return `${symbol}${Number(price).toLocaleString('en-IN')}`;
}

export default async function ProductPage({ params }) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const price = formatPrice(product.price, product.currency);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto grid w-full max-w-5xl flex-1 grid-cols-1 gap-10 px-4 py-10 md:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-stone-400">
              No image
            </div>
          )}
        </div>
        <div>
          <span className="w-fit rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
            {product.source_site}
            {product.category_name ? ` · ${product.category_name}` : ''}
          </span>
          <h1 className="mt-3 text-2xl font-bold text-stone-900 sm:text-3xl">{product.name}</h1>
          {price && <p className="mt-3 text-2xl font-extrabold text-stone-900">{price}</p>}
          {product.description && (
            <p className="mt-4 whitespace-pre-line text-stone-600">{product.description}</p>
          )}
          <a
            href={`/go/${product.id}`}
            className="mt-8 inline-block w-full rounded-xl bg-brand-600 px-6 py-3.5 text-center text-lg font-semibold text-white shadow hover:bg-brand-700 sm:w-auto"
          >
            Buy on {product.source_site} →
          </a>
          <p className="mt-3 text-xs text-stone-400">
            You&apos;ll be taken to {product.source_site} to complete your purchase. As an
            affiliate, we may earn a commission on qualifying purchases.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
