import Link from 'next/link';

function formatPrice(price, currency) {
  if (price === null || price === undefined) return null;
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '\u20ac' : '\u20b9';
  return `${symbol}${Number(price).toLocaleString('en-IN')}`;
}

export default function ProductCard({ product }) {
  const price = formatPrice(product.price, product.currency);

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="aspect-square w-full overflow-hidden bg-stone-100">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover transition group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-stone-400">
              No image
            </div>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="w-fit rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
          {product.source_site}
        </span>
        <Link href={`/product/${product.slug}`}>
          <h3 className="line-clamp-2 font-semibold text-stone-900 hover:text-brand-700">
            {product.name}
          </h3>
        </Link>
        {product.description && (
          <p className="line-clamp-2 text-sm text-stone-500">{product.description}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          {price ? <span className="font-bold text-stone-900">{price}</span> : <span />}
          <a
            href={`/go/${product.id}`}
            className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Buy Now
          </a>
        </div>
      </div>
    </div>
  );
}
