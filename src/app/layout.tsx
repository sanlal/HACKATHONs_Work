import type { Metadata } from "next";
import Link from "next/link";
import { DoorOpen } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "JeevanDwaar — Direct opportunities, better livelihoods",
  description:
    "Fair local work, direct farmer-to-buyer produce sales, and affordable or donated books in one multilingual platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-[#dce5e1] bg-white/85 backdrop-blur">
          <div className="shell flex min-h-18 items-center justify-between gap-6">
            <Link
              href="/"
              className="focus-ring flex items-center gap-2 rounded-lg font-extrabold tracking-[-0.03em]"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-[#177245] text-white">
                <DoorOpen aria-hidden="true" size={22} />
              </span>
              <span className="text-xl">
                Jeevan<span className="text-[#177245]">Dwaar</span>
              </span>
            </Link>

            <nav aria-label="Primary navigation" className="hidden items-center gap-7 text-sm font-semibold md:flex">
              <Link className="focus-ring rounded" href="/work">Find work</Link>
              <Link className="focus-ring rounded" href="/produce">Farm market</Link>
              <Link className="focus-ring rounded" href="/books">Books</Link>
            </nav>

            <Link
              href="/onboarding"
              className="focus-ring rounded-full bg-[#102a43] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#177245]"
            >
              Get started
            </Link>
          </div>
        </header>
        {children}
        <footer className="border-t border-[#dce5e1] bg-white py-8">
          <div className="shell flex flex-col justify-between gap-3 text-sm text-[#557089] sm:flex-row">
            <p>© 2026 JeevanDwaar. Built for OpenAI Build Week.</p>
            <p>English · తెలుగు</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
