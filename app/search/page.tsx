import Link from "next/link";
import MovieCard from "../components/movieCard";
import { searchTmdbMovies } from "../lib/tmdb";
import type { MoviePage } from "../lib/types";

export const metadata = { title: "Search movies" };
type SearchParams = { q?: string | string[]; page?: string | string[] };

export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const requestedPage = typeof params.page === "string" ? Number(params.page) : 1;
  const page = Number.isInteger(requestedPage) && requestedPage >= 1 && requestedPage <= 500 ? requestedPage : 1;
  const href = (nextPage: number) => `/search?${new URLSearchParams({ q: query, page: String(nextPage) })}`;
  let data: MoviePage | null = null;
  let failed = false;
  if (query) {
    try { data = await searchTmdbMovies(query, page); }
    catch { failed = true; }
  }
  return <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-12">
    <p className="eyebrow mb-3">Find your next watch</p>
    <h1 className="break-words text-3xl font-semibold tracking-tight sm:text-4xl">{query ? `Search results for “${query}”` : "Search movies"}</h1>
    {!query && <p className="mt-5 text-muted-foreground">Enter a movie title to search.</p>}
    {failed && <div role="alert" className="notice notice-error mt-6 flex flex-wrap items-center justify-between gap-3">
      <p>Movies couldn&apos;t load. Please try again.</p><a href={href(page)} className="button button-secondary">Try again</a>
    </div>}
    {data && <>
      {data.results.length === 0 ? <div className="mt-8 rounded-xl border border-dashed border-border p-6">
        <p className="font-medium">No movies found</p><p className="mt-2 text-sm text-muted-foreground">Try a different title or check your spelling.</p>
      </div> : <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-5">
        {data.results.map((movie) => <MovieCard key={movie.id} movie={movie} grid />)}
      </div>}
      <nav aria-label="Search results pages" className="mt-8 flex flex-wrap items-center gap-3">
        {page > 1 && <Link href={href(page - 1)} className="button button-secondary">Previous</Link>}
        {data.total_pages > 0 && <span className="text-sm text-muted-foreground">Page {page} of {data.total_pages}</span>}
        {page < data.total_pages && <Link href={href(page + 1)} className="button button-secondary">Next</Link>}
      </nav>
    </>}
  </div>;
}
