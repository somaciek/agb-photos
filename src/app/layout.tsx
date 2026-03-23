import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "AGB Photos",
  description: "Zarządzanie sesjami zdjęciowymi SKU",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className="antialiased">
        <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-6">
          <Link href="/" className="text-lg font-bold text-gray-900">
            AGB Photos
          </Link>
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            SKU
          </Link>
          <Link href="/channels" className="text-sm text-gray-600 hover:text-gray-900">
            Kanały
          </Link>
        </nav>
        <main className="max-w-6xl mx-auto px-6 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
