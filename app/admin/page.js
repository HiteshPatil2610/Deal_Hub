'use client';

import { useEffect, useState } from 'react';

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <p className="text-sm text-stone-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-stone-900">{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((data) => setStats(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-stone-500">Loading...</p>;
  if (!stats?.totals) return <p className="text-stone-500">Could not load stats.</p>;

  const { totals, topProducts, recentClicks } = stats;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Products" value={totals.total_products} />
        <StatCard label="Active Products" value={totals.active_products} />
        <StatCard label="Total Clicks" value={totals.total_clicks} />
        <StatCard label="Clicks (24h)" value={totals.clicks_today} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="font-semibold text-stone-900">Top Products by Clicks</h2>
          <ul className="mt-4 divide-y divide-stone-100">
            {topProducts.length === 0 && <p className="text-sm text-stone-400">No data yet.</p>}
            {topProducts.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2 text-sm">
                <span className="truncate text-stone-700">{p.name}</span>
                <span className="font-semibold text-stone-900">{p.click_count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="font-semibold text-stone-900">Recent Activity</h2>
          <ul className="mt-4 divide-y divide-stone-100">
            {recentClicks.length === 0 && <p className="text-sm text-stone-400">No clicks yet.</p>}
            {recentClicks.map((c) => (
              <li key={c.id} className="py-2 text-sm">
                <span className="text-stone-700">{c.product_name}</span>{' '}
                <span className="text-stone-400">
                  · {new Date(c.clicked_at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
