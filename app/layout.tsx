import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Music Blog",
  description: "An old-fashioned blog with essays and embedded Spotify playlists"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="site-shell">
          <header className="site-header">
            <Link href="/" className="brand">
              Songs This Week
            </Link>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
