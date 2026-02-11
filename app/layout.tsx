import type { Metadata } from "next";
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
            <a href="/" className="brand">
              Music Blog
            </a>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
