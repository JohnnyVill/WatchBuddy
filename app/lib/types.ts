export type Movie = {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string;
};
export type MovieDetails = Movie & {
  tagline: string;
  runtime: number | null;
  genres: { id: number; name: string }[];
};
export type Trailer = { id: string; key: string; name: string; official: boolean; site: string; type: string };
export type Provider = { provider_id: number; provider_name: string; logo_path: string | null };
export type ProviderAvailability = { link?: string; flatrate?: Provider[]; rent?: Provider[]; buy?: Provider[] };
export type CategoryKey = "popular" | "top_rated" | "now_playing" | "upcoming";
export type MoviePage = { results: Movie[]; page: number; total_pages: number };
export type CatalogSection = MoviePage & { error?: string };
export type MovieCatalog = Record<CategoryKey, CatalogSection>;
export type ApiError = { message: string };
export type WatchedResponse = { results: Movie[] };
