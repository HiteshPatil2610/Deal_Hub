import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            D
          </span>
          <span className="text-lg font-bold tracking-tight">DealHub</span>
        </Link>
        <nav className="hidden gap-6 text-sm font-medium text-stone-600 sm:flex">
          <Link href="/" className="hover:text-brand-600">
            All Picks
          </Link>
        </nav>
      </div>
    </header>
  );
}
