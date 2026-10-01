import HomeRows from "./movieRows";
import { ArrowDown, CheckCircle, FilmSlate, Television } from "@phosphor-icons/react/dist/ssr";
import type { MovieCatalog } from "../lib/types";
export default function Home({ catalog }: { catalog: MovieCatalog }) {
  return (
    <>
      <section className="hero relative overflow-hidden border-b border-border">
        <div className="hero-glow" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16">
          <p className="eyebrow mb-4 flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-accent" /> Less scrolling. More movie nights.</p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
            Your next great watch<br /><span className="text-muted-foreground">starts here.</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
            Discover a movie, find where it&apos;s streaming, and remember the ones you&apos;ve loved.
          </p>
          <a href="#browse" className="button button-primary mt-7">Browse movies <ArrowDown size={18} aria-hidden="true" /></a>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs text-muted-foreground sm:text-sm">
            <span className="flex items-center gap-2"><FilmSlate size={18} aria-hidden="true" /> Find your next favorite</span>
            <span className="flex items-center gap-2"><Television size={18} aria-hidden="true" /> See where to watch</span>
            <span className="flex items-center gap-2"><CheckCircle size={18} aria-hidden="true" /> Keep your movie history</span>
          </div>
        </div>
      </section>
      <HomeRows catalog={catalog} />
    </>
  );
}
