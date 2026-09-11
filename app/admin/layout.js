'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/admin/login' || pathname === '/admin/setup') {
    return children;
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  const linkClass = (href) =>
    `rounded-lg px-3 py-2 text-sm font-medium ${
      pathname === href ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
    }`;

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-bold text-stone-900">
              DealHub Admin
            </Link>
            <nav className="flex gap-1">
              <Link href="/admin" className={linkClass('/admin')}>
                Dashboard
              </Link>
              <Link href="/admin/products" className={linkClass('/admin/products')}>
                Products
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" target="_blank" className="text-sm text-stone-500 hover:text-stone-800">
              View site ↗
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-100"
            >
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
