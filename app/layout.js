import './globals.css';

export const metadata = {
  title: 'DealHub — Handpicked Finds',
  description: 'Handpicked product recommendations, curated just for you.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen text-stone-900 antialiased">{children}</body>
    </html>
  );
}
