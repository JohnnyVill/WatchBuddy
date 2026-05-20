import "server-only";

const TMDB_API_KEY = process.env.TMDB_API_KEY?.trim() ?? "";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const options = {
  method: "GET",
  headers: {
    Authorization: `Bearer ${TMDB_API_KEY}`,
    accept: "application/json",
  },
};

// ── core fetch helper (movies list) ──────────────────────────────

export async function fetchTmdbMovies(endpoint: string, page = 1) {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/${endpoint}?language=en-US&page=${page}`,
      { ...options, cache: "no-store" },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Read as text first so we can detect empty bodies before JSON.parse
    const text = await response.text();
    if (!text || text.trim().length === 0) {
      console.warn(
        `[tmdb] ${endpoint} page ${page} → empty response body (status ${response.status})`,
      );
      return [];
    }

    const data = JSON.parse(text);
    console.log(
      `[tmdb] ${endpoint} page ${page} → ${data.results?.length ?? 0} results`,
    );
    return data.results;
  } catch (error) {
    console.error(
      `[tmdb] ${endpoint} page ${page} →`,
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}

// ── convenience wrappers ────────────────────────────────────────

export function fetchPopularMovies() {
  return fetchTmdbMovies("discover/movie", 1);
}

export function fetchTopRatedMovies() {
  return fetchTmdbMovies("movie/top_rated");
}

export function fetchNowPlayingMovies() {
  return fetchTmdbMovies("movie/now_playing");
}

export function fetchUpcomingMovies() {
  return fetchTmdbMovies("movie/upcoming");
}

// ── movie details ───────────────────────────────────────────────

export async function fetchMovieDetails(movieId: string) {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?language=en-US`,
      { ...options, cache: "no-store" },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    if (!text || text.trim().length === 0) {
      console.warn(
        `[tmdb] movie/${movieId} details → empty response body (status ${response.status})`,
      );
      return null;
    }

    return JSON.parse(text);
  } catch (error) {
    console.error(
      `[tmdb] movie/${movieId} details →`,
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

// ── movie trailers ──────────────────────────────────────────────

export async function fetchMovieTrailers(movieId: string) {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}/videos?language=en-US`,
      { ...options, cache: "no-store" },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    if (!text || text.trim().length === 0) {
      console.warn(
        `[tmdb] movie/${movieId} trailers → empty response body (status ${response.status})`,
      );
      return [];
    }

    const data = JSON.parse(text);
    return data.results;
  } catch (error) {
    console.error(
      `[tmdb] movie/${movieId} trailers →`,
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}

// ── watch providers ─────────────────────────────────────────────

export async function fetchWhereToWatch(movieId: string) {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}/watch/providers`,
      { ...options, cache: "no-store" },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    if (!text || text.trim().length === 0) {
      console.warn(
        `[tmdb] movie/${movieId} providers → empty response body (status ${response.status})`,
      );
      return null;
    }

    const data = JSON.parse(text);
    return data.results.US || null;
  } catch (error) {
    console.error(
      `[tmdb] movie/${movieId} providers →`,
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}
