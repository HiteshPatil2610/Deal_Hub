import { query } from '@/lib/db';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getCategories() {
  const { rows } = await query('SELECT id, name, slug FROM categories ORDER BY name ASC');
  return rows;
}

async function getProducts({ category, q }) {
  const conditions = ['is_active = true'];
  const params = [];

  if (category) {
    params.push(category);
    conditions.push(`category_id = (SELECT id FROM categories WHERE slug = $${params.length})`);
  }
  if (q) {
    params.push(`%${q}%`);
    conditions.push(`(name ILIKE $${params.length} OR description ILIKE $${params.length})`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT id, name, slug, description, image_url, price, currency, source_site
     FROM products ${where}
     ORDER BY featured DESC, created_at DESC`,
    params
  );
  return rows;
}

export default async function HomePage({ searchParams }) {
  const category = searchParams?.category || '';
  const q = searchParams?.q || '';

  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({ category, q })
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <section className="mb-8 rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 px-6 py-10 text-white sm:px-10 sm:py-14">
          <h1 className="text-2xl font-extrabold sm:text-4xl">Handpicked finds, worth buying</h1>
          <p className="mt-2 max-w-xl text-brand-100">
            Every product here is picked, tested with a critical eye, and linked straight to the
            store so you can grab it in one click.
          </p>
          <form action="/" className="mt-6 flex max-w-md gap-2">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search products..."
              className="w-full rounded-xl border-0 px-4 py-2.5 text-stone-900 shadow focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button
              type="submit"
              className="rounded-xl bg-stone-900 px-4 py-2.5 font-semibold text-white hover:bg-stone-800"
            >
              Search
            </button>
          </form>
        </section>

        <div className="mb-6 flex flex-wrap gap-2">
          <Link
            href="/"
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              !category ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 border border-stone-200'
            }`}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/?category=${c.slug}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                category === c.slug
                  ? 'bg-stone-900 text-white'
                  : 'bg-white text-stone-600 border border-stone-200'
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        {products.length === 0 ? (
          <p className="rounded-xl border border-dashed border-stone-300 p-10 text-center text-stone-500">
            No products yet. Add some from the admin panel!
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
