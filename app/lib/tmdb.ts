import "server-only";
import { categoryEndpoints, filterMoviePage } from "./catalog";
import type { CategoryKey, MovieDetails, MoviePage, ProviderAvailability, Trailer } from "./types";
const baseUrl = process.env.TMDB_BASE_URL || "https://api.themoviedb.org/3";
class TmdbError extends Error {
  constructor(public status: number) { super(`TMDB request failed (${status})`); }
}
async function fetchTmdb<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${baseUrl}/${endpoint}`, {
    headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY?.trim() ?? ""}`, accept: "application/json" },
    next: { revalidate: 900 },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new TmdbError(response.status);
  return response.json() as Promise<T>;
}
export async function fetchTmdbMovies(category: CategoryKey, page = 1): Promise<MoviePage> {
  const data = await fetchTmdb<MoviePage>(`${categoryEndpoints[category]}?language=en-US&region=US&page=${page}`);
  if (!Array.isArray(data.results) || !Number.isInteger(data.total_pages)) throw new Error("Invalid movie catalog response");
  return filterMoviePage({ ...data, total_pages: Math.min(data.total_pages, 500) }, category);
}
export async function searchTmdbMovies(query: string, page = 1): Promise<MoviePage> {
  const params = new URLSearchParams({ query, page: String(page), language: "en-US", include_adult: "false" });
  const data = await fetchTmdb<MoviePage>(`search/movie?${params}`);
  if (!Array.isArray(data.results) || !Number.isInteger(data.total_pages)) throw new Error("Invalid movie search response");
  return { ...data, total_pages: Math.min(data.total_pages, 500) };
}
export async function fetchMovieDetails(movieId: string): Promise<MovieDetails | null> {
  try { return await fetchTmdb<MovieDetails>(`movie/${movieId}?language=en-US`); }
  catch (error) {
    if (error instanceof TmdbError && error.status === 404) return null;
    throw error;
  }
}
export async function fetchMovieTrailers(movieId: string): Promise<Trailer[]> {
  const data = await fetchTmdb<{ results: Trailer[] }>(`movie/${movieId}/videos?language=en-US`);
  return data.results ?? [];
}
export async function fetchWhereToWatch(movieId: string): Promise<ProviderAvailability | null> {
  const data = await fetchTmdb<{ results: Record<string, ProviderAvailability> }>(`movie/${movieId}/watch/providers`);
  return data.results.US ?? null;
}
