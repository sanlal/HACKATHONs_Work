import type { Metadata } from "next";
import { LanguageProvider } from "@/components/i18n/language-provider";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: {
    default: "JeevanDwaar — Direct opportunities, better livelihoods",
    template: "%s · JeevanDwaar",
  },
  description:
    "Fair local work, direct farmer-to-buyer produce sales, and affordable or donated books in one multilingual platform.",
  openGraph: {
    title: "JeevanDwaar",
    description:
      "One multilingual doorway to local work, direct farm markets and reusable books.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html data-scroll-behavior="smooth" lang="en">
      <body>
        <LanguageProvider>
          <a
            className="skip-link focus-ring"
            href="#main-content"
          >
            Skip to main content
          </a>
          <SiteHeader />
          <div id="main-content" tabIndex={-1}>
            {children}
          </div>
          <footer className="border-t border-[#dce5e1] bg-white py-8">
            <div className="shell flex flex-col justify-between gap-3 text-sm text-[#557089] sm:flex-row">
              <p>© 2026 JeevanDwaar. Built for OpenAI Build Week.</p>
              <p>English · తెలుగు</p>
            </div>
          </footer>
        </LanguageProvider>
      </body>
    </html>
  );
}
