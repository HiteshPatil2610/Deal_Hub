export default function Footer() {
  return (
    <footer className="mt-16 border-t border-stone-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-stone-500">
        <p>
          As an affiliate, we may earn a commission from qualifying purchases made through links
          on this site, at no extra cost to you.
        </p>
        <p className="mt-2">&copy; {new Date().getFullYear()} DealHub. All rights reserved.</p>
      </div>
    </footer>
  );
}
