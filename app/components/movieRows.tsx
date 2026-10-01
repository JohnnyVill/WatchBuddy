"use client";
import { useCallback, useEffect, useId, useRef, useState, type PointerEvent } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle, FilmSlate, Star } from "@phosphor-icons/react";
import MovieImage from "./movieImage";
import { useAuth } from "./authProvider";
import { categories, mergeMovies } from "../lib/catalog";
import type { CatalogSection, CategoryKey, Movie, MovieCatalog, MoviePage, WatchedResponse } from "../lib/types";

export function MovieSkeletons() {
  return <>{Array.from({ length: 6 }, (_, index) => (
    <div key={index} className="w-[152px] shrink-0 space-y-3 md:w-[192px]" aria-hidden="true">
      <div className="aspect-[2/3] animate-pulse rounded-xl bg-neutral-900" />
      <div className="h-3 w-3/4 animate-pulse rounded bg-neutral-900" />
      <div className="h-3 w-1/2 animate-pulse rounded bg-neutral-900" />
    </div>
  ))}</>;
}

function MovieCard({ movie }: { movie: Movie }) {
  return <Link href={`/movies/${movie.id}`} className="movie-card group block w-[152px] shrink-0 snap-start md:w-[192px]">
    <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-white/5 bg-neutral-900">
      <MovieImage path={movie.poster_path} title={movie.title} />
    </div>
    <h3 className="mt-3 line-clamp-2 text-sm font-medium leading-5 group-hover:text-white">{movie.title}</h3>
    <div className="mt-1.5 flex items-center justify-between gap-2 text-xs text-muted-foreground">
      <span>{movie.release_date?.slice(0, 4) || "Release TBD"}</span>
      <span className="flex items-center gap-1"><Star size={12} weight="fill" className="text-amber-400" aria-hidden="true" />
        <span aria-label={movie.vote_average > 0 ? `Rated ${movie.vote_average.toFixed(1)} out of 10` : "Not yet rated"}>
          {movie.vote_average > 0 ? movie.vote_average.toFixed(1) : "Not rated"}
        </span>
      </span>
    </div>
  </Link>;
}

function MovieRow({ title, description, initial, category, history = false }: {
  title: string; description: string; initial: CatalogSection; category?: CategoryKey; history?: boolean;
}) {
  const rowId = useId();
  const rail = useRef<HTMLDivElement>(null);
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [edges, setEdges] = useState({ start: true, end: false });
  const inFlight = useRef(false);
  const drag = useRef({ active: false, moved: false, x: 0, scroll: 0 });
  const [dragging, setDragging] = useState(false);
  const hasMore = !!category && data.page < data.total_pages;
  const measure = useCallback(() => {
    const element = rail.current;
    if (element) setEdges({
      start: element.scrollLeft < 4,
      end: element.scrollWidth - element.clientWidth - element.scrollLeft < 4,
    });
  }, []);
  useEffect(() => {
    const element = rail.current;
    if (!element) return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    for (const child of element.children) observer.observe(child);
    return () => observer.disconnect();
  }, [measure, data.results.length, loading]);
  async function loadMore() {
    if (!category || inFlight.current || (!hasMore && !data.error)) return;
    inFlight.current = true; setLoading(true);
    try {
      const response = await fetch(`/api/movies?category=${category}&page=${data.page + 1}`);
      if (!response.ok) throw new Error("Movies couldn't load. Please try again.");
      const next: MoviePage = await response.json();
      setData((current) => ({ ...next, results: mergeMovies(current.results, next.results) }));
    } catch {
      setData((current) => ({ ...current, error: "Movies couldn't load. Your place is saved; try again." }));
    } finally { inFlight.current = false; setLoading(false); }
  }
  function scroll(direction: number) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    rail.current?.scrollBy({ left: direction * rail.current.clientWidth * 0.85, behavior: reduceMotion ? "instant" : "smooth" });
  }
  function pointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    drag.current = { active: true, moved: false, x: event.clientX, scroll: event.currentTarget.scrollLeft };
  }
  function pointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current.active) return;
    const distance = event.clientX - drag.current.x;
    if (Math.abs(distance) > 8) {
      if (!drag.current.moved) {
        drag.current.moved = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        setDragging(true);
      }
      event.preventDefault();
      event.currentTarget.scrollLeft = drag.current.scroll - distance;
    }
  }
  function pointerUp() { drag.current.active = false; setDragging(false); }
  return (
    <section id={history ? "history" : undefined} aria-labelledby={`${rowId}-heading`} className="scroll-mt-24 py-7 md:py-9">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 id={`${rowId}-heading`} className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {data.results.length > 0 && <div className="hidden shrink-0 gap-2 md:flex">
          <button className="icon-button" aria-label={`Previous movies in ${title}`} aria-controls={rowId} disabled={edges.start} onClick={() => scroll(-1)}><ArrowLeft size={18} /></button>
          <button className="icon-button" aria-label={`Next movies in ${title}`} aria-controls={rowId} disabled={edges.end} onClick={() => scroll(1)}><ArrowRight size={18} /></button>
        </div>}
      </div>
      {data.results.length === 0 && !loading && !data.error ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-8">
          {history ? <CheckCircle size={28} className="mb-3 text-muted-foreground" aria-hidden="true" /> : <FilmSlate size={28} className="mb-3 text-muted-foreground" aria-hidden="true" />}
          <p className="font-medium">{history ? "Your movie story starts here" : "No movies to show just yet"}</p>
          <p className="mt-2 text-sm text-muted-foreground">{history ? "Mark a movie as watched to start your history." : "Check back soon, or browse another category."}</p>
          {history && <a href="#browse" className="button button-secondary mt-4">Find a movie <ArrowRight size={16} aria-hidden="true" /></a>}
        </div>
      ) : null}
      <div id={rowId} ref={rail} aria-busy={loading}
        className={`movie-rail flex gap-4 overflow-x-auto pb-3 ${dragging ? "dragging" : ""}`}
        onScroll={() => {
          measure();
          const element = rail.current;
          if (element && element.scrollWidth - element.scrollLeft - element.clientWidth < 280 && !data.error) void loadMore();
        }}
        onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp}
        onLostPointerCapture={pointerUp}
        onPointerLeave={() => { if (!drag.current.moved) pointerUp(); }}
        onDragStart={(event) => event.preventDefault()}
        onClickCapture={(event) => { if (drag.current.moved && event.detail !== 0) { event.preventDefault(); event.stopPropagation(); } }}>
        {data.results.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
        {loading && <MovieSkeletons />}
      </div>
      {data.error && <div role="alert" className="notice notice-error mt-3 flex flex-wrap items-center justify-between gap-3">
        <p>{data.error}</p><button className="button button-secondary" onClick={() => void loadMore()} disabled={loading}>Try again</button>
      </div>}
      {!data.error && hasMore && <button className="button button-secondary mt-3" onClick={() => void loadMore()} disabled={loading}>
        {loading ? "Loading movies…" : "Load more"} {!loading && <ArrowRight size={16} aria-hidden="true" />}
      </button>}
      <span role="status" className="sr-only">{loading ? `Loading ${title}` : `${data.results.length} movies in ${title}`}</span>
    </section>
  );
}

function WatchHistory() {
  const [history, setHistory] = useState<Movie[] | null>(null);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch("/api/movies/watched", { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("History unavailable");
        const data: WatchedResponse = await response.json();
        if (!controller.signal.aborted) { setHistory(data.results); setError(""); }
      } catch {
        if (!controller.signal.aborted) setError("Your watch history couldn't load. Please try again.");
      }
    }
    void load();
    return () => controller.abort();
  }, [version]);
  useEffect(() => {
    const refresh = () => { setHistory(null); setVersion((value) => value + 1); };
    window.addEventListener("watch-history-changed", refresh);
    return () => window.removeEventListener("watch-history-changed", refresh);
  }, []);
  if (error) return <section id="history" className="scroll-mt-24 py-8">
    <h2 className="mb-4 text-xl font-semibold">Your watch history</h2>
    <div className="notice notice-error flex flex-wrap items-center justify-between gap-3">
      <p role="alert">{error}</p>
      <button className="button button-secondary" onClick={() => { setError(""); setHistory(null); setVersion((value) => value + 1); }}>Try again</button>
    </div>
  </section>;
  if (history === null) return <section id="history" className="scroll-mt-24 py-8" aria-busy="true">
    <h2 className="mb-5 text-xl font-semibold">Your watch history</h2>
    <div className="flex gap-4 overflow-hidden"><MovieSkeletons /></div>
    <span role="status" className="sr-only">Loading watch history</span>
  </section>;
  return <MovieRow key={version} title="Your watch history" description="The movies you've already made time for." history initial={{ results: history, page: 1, total_pages: 1 }} />;
}

export default function HomeRows({ catalog }: { catalog: MovieCatalog }) {
  const { username } = useAuth();
  return <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
    {username && <WatchHistory key={username} />}
    <div id="browse" className="scroll-mt-24">
      {categories.map(({ key, title, description }) => <MovieRow key={key} category={key} title={title} description={description} initial={catalog[key]} />)}
    </div>
  </div>;
}
