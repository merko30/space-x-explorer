import Link from "next/link";
import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "SpaceX Explorer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#061a33] text-white">
        <Providers>
          <main className="min-h-screen">
            <header className="bg-slate-900/80 border-b border-slate-700">
              <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <Link
                  href="/"
                  className="text-sm uppercase tracking-[0.24em] text-slate-400"
                >
                  <h1 className="text-3xl font-bold tracking-[0.24em] uppercase text-white">
                    SpaceX Explorer
                  </h1>
                </Link>
              </div>
            </header>
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </Providers>
      </body>
    </html>
  );
}
