'use client';

import { useEffect, useState } from 'react';

const EMPTY_FORM = {
  id: null,
  name: '',
  description: '',
  image_url: '',
  price: '',
  currency: 'INR',
  source_site: 'Amazon',
  affiliate_url: '',
  category_id: '',
  featured: false,
  is_active: true
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [scraping, setScraping] = useState(false);

  async function loadAll() {
    const [pRes, cRes] = await Promise.all([fetch('/api/products'), fetch('/api/categories')]);
    const pData = await pRes.json();
    const cData = await cRes.json();
    setProducts(pData.products || []);
    setCategories(cData.categories || []);
  }

  useEffect(() => {
    loadAll();
  }, []);

  function openNewForm() {
    setForm(EMPTY_FORM);
    setShowForm(true);
    setError('');
  }

  function openEditForm(p) {
    setForm({
      id: p.id,
      name: p.name,
      description: p.description || '',
      image_url: p.image_url || '',
      price: p.price || '',
      currency: p.currency || 'INR',
      source_site: p.source_site || 'Amazon',
      affiliate_url: p.affiliate_url,
      category_id: p.category_id || '',
      featured: p.featured,
      is_active: p.is_active
    });
    setShowForm(true);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: form.price === '' ? null : Number(form.price),
        category_id: form.category_id === '' ? null : Number(form.category_id)
      };
      const url = form.id ? `/api/products/${form.id}` : '/api/products';
      const method = form.id ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to save product');
        return;
      }
      setShowForm(false);
      loadAll();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleScrape() {
    if (!form.affiliate_url.trim()) {
      setError('Enter an Amazon or Flipkart product URL first.');
      return;
    }

    setError('');
    setScraping(true);
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: form.affiliate_url.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to scrape product details.');
        return;
      }

      setForm((current) => ({
        ...current,
        name: data.name || current.name,
        description: data.description || current.description,
        image_url: data.image_url || current.image_url,
        price: data.price || current.price,
        currency: data.currency || current.currency,
        source_site: data.source_site || current.source_site
      }));
    } catch {
      setError('Unable to scrape this URL. Please try again.');
    } finally {
      setScraping(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    loadAll();
  }

  async function handleAddCategory(e) {
    e.preventDefault();
    if (!newCategory.trim()) return;
    await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCategory.trim() })
    });
    setNewCategory('');
    loadAll();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-stone-900">Products</h1>
        <button
          onClick={openNewForm}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          + Add Product
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-stone-500">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image_url} alt="" className="h-10 w-10 rounded-lg object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-stone-100" />
                    )}
                    <span className="font-medium text-stone-800">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-stone-500">{p.source_site}</td>
                <td className="px-4 py-3 text-stone-500">{p.price ? `₹${p.price}` : '—'}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.is_active ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {p.is_active ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => openEditForm(p)}
                    className="mr-3 text-brand-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-stone-400">
                  No products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-stone-900">
              {form.id ? 'Edit Product' : 'Add Product'}
            </h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium text-stone-700">Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-stone-700">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-stone-700">Image URL</label>
                <input
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
                  placeholder="https://..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-stone-700">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-700">Currency</label>
                  <select
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-stone-700">Source Site</label>
                <input
                  value={form.source_site}
                  onChange={(e) => setForm({ ...form, source_site: e.target.value })}
                  placeholder="Amazon, Flipkart, etc."
                  className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-stone-700">
                  Affiliate / Product URL
                </label>
                <div className="mt-1 flex gap-2">
                  <input
                    required
                    value={form.affiliate_url}
                    onChange={(e) => setForm({ ...form, affiliate_url: e.target.value })}
                    placeholder="https://amazon.in/dp/..."
                    className="w-full rounded-lg border border-stone-300 px-3 py-2"
                  />
                  <button
                    type="button"
                    onClick={handleScrape}
                    disabled={scraping}
                    className="whitespace-nowrap rounded-lg border border-brand-600 px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50 disabled:opacity-50"
                  >
                    {scraping ? 'Reading...' : 'Fetch details'}
                  </button>
                </div>
                <p className="mt-1 text-xs text-stone-500">Supports Amazon and Flipkart product URLs.</p>
              </div>
              <div>
                <label className="text-sm font-medium text-stone-700">Category</label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
                >
                  <option value="">None</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <div className="mt-2 flex gap-2">
                  <input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="New category name"
                    className="w-full rounded-lg border border-stone-300 px-3 py-1.5 text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="whitespace-nowrap rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium hover:bg-stone-50"
                  >
                    + Add
                  </button>
                </div>
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm text-stone-700">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-sm text-stone-700">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  />
                  Active (visible on site)
                </label>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
