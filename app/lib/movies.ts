import { categories } from "./catalog";
import { fetchTmdbMovies } from "./tmdb";
import type { MovieCatalog } from "./types";
export async function fetchMovieData(): Promise<MovieCatalog> {
  const entries = await Promise.all(categories.map(async ({ key }) => {
    try { return [key, await fetchTmdbMovies(key)] as const; }
    catch (error) {
      console.error(`Catalog ${key} failed:`, error instanceof Error ? error.message : "Unknown error");
      return [key, { results: [], page: 0, total_pages: 1, error: "Movies couldn't load. Please try again." }] as const;
    }
  }));
  return Object.fromEntries(entries) as MovieCatalog;
}
