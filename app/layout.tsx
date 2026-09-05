import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SearchProvider } from "@/components/search/SearchProvider";
import { buildSearchIndex } from "@/lib/search-index";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Hunt the Infrastructure",
    template: "%s | Hunt the Infrastructure",
  },
  description: "Threat hunting beyond the endpoint.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const searchEntries = buildSearchIndex();

  return (
    <html lang="en">
      <body>
        <SearchProvider entries={searchEntries}>
          <Header />
          <main id="main-content">{children}</main>
          <Footer />
        </SearchProvider>
      </body>
    </html>
  );
}
