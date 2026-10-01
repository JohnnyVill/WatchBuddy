import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { getSession } from "./lib/session";
import AuthProvider from "./components/authProvider";
import Header from "./components/header";
export const viewport: Viewport = { themeColor: "#0a0a0a", width: "device-width", initialScale: 1 };
export const metadata: Metadata = {
  title: { default: "WatchBuddy — Discover your next watch", template: "%s | WatchBuddy" },
  description: "Discover movies, find where to stream in the United States, and keep track of what you've watched.",
};
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();
  return (
    <html lang="en" className="antialiased" data-scroll-behavior="smooth">
      <body>
        <AuthProvider initialUsername={session?.username ?? (session ? "Movie lover" : null)}>
          <a href="#main-content" className="skip-link">Skip to content</a>
          <Header />
          <main id="main-content" tabIndex={-1} className="min-h-[70dvh]">{children}</main>
          <footer className="border-t border-border px-4 py-8 sm:px-6">
            <div className="mx-auto flex max-w-7xl flex-col gap-2 text-xs leading-relaxed text-muted-foreground sm:flex-row sm:justify-between">
              <p>WatchBuddy · A little less &ldquo;what should we watch?&rdquo;</p>
              <p>Movie data by <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer" className="underline underline-offset-4">TMDB</a>. Availability for the United States.</p>
            </div>
          </footer>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
