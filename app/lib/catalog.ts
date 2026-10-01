import type { CategoryKey, Movie, MoviePage } from "./types";
export const categories: { key: CategoryKey; title: string; description: string }[] = [
  { key: "popular", title: "Popular movies", description: "The movies everyone is talking about." },
  { key: "top_rated", title: "Top rated", description: "Audience favorites worth your time." },
  { key: "now_playing", title: "Now playing", description: "On the big screen right now." },
  { key: "upcoming", title: "Coming soon", description: "Something to look forward to." },
];
export const categoryEndpoints: Record<CategoryKey, string> = {
  popular: "movie/popular", top_rated: "movie/top_rated", now_playing: "movie/now_playing", upcoming: "movie/upcoming",
};
export function isCategory(value: string | null): value is CategoryKey {
  return value !== null && Object.hasOwn(categoryEndpoints, value);
}
export function mergeMovies(existing: Movie[], incoming: Movie[]): Movie[] {
  return [...new Map([...existing, ...incoming].map((movie) => [movie.id, movie])).values()];
}
export function filterMoviePage(data: MoviePage, category: CategoryKey, today = new Date().toISOString().slice(0, 10)): MoviePage {
  return {
    ...data,
    results: mergeMovies([], category === "upcoming"
      ? data.results.filter((movie) => movie.release_date && movie.release_date >= today)
      : data.results),
  };
}
