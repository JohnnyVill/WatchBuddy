import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
const TMDB_API_KEY = process.env.TMDB_API_KEY

const TMDB_BASE_URL = "https://api.themoviedb.org/3"
const options = {
    method: 'GET',
    headers: {
        Authorization: `Bearer ${TMDB_API_KEY}`,
    }
}

const redis = Redis.fromEnv()

export const ratelimit = new Ratelimit ({
    redis,
    limiter: Ratelimit.slidingWindow(100, "60 s"), // 100 requests per minute

})

export async function fetchTmdbMovies(endpoint: string, page = 1) {
    try {
        const response = await fetch(`${TMDB_BASE_URL}/${endpoint}?language=en-US&page=${page}`,
            {
            ...options,
            next:{revalidate: 3600} 
            })
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        //console.log(`Fetched ${endpoint} page ${page}:`, data)
        return data.results
    } catch (error) {
        //console.error(`Error fetching ${endpoint} page ${page}:`, error)
        return []
    }
}
export function fetchPopularMovies(page?: number) {
    return fetchTmdbMovies("movie/popular", page)
}

export function fetchTopRatedMovies() {
    return fetchTmdbMovies("movie/top_rated")
}

export function fetchNowPlayingMovies() {
    return fetchTmdbMovies("movie/now_playing")
}

export function fetchUpcomingMovies() {
    return fetchTmdbMovies("movie/upcoming")
}

export async function fetchMovieDetails(movieId: string) {
    try {
        const response = await fetch(`${TMDB_BASE_URL}/movie/${movieId}?language=en-US`, options)
        if(!response.ok) {
            throw new Error(`Http error! status: ${response.status}`)
        }
        const data = await response.json()
        //console.log(`Fetched details for movie ${movieId}:`, data)
        return data
    } catch (error) {
        //console.error(`Error fetching details for movie ${movieId}:`, error)
        return null
    }
}

export async function fetchMovieTrailers(movieId: string) {
    try {
        const response = await fetch(`${TMDB_BASE_URL}/movie/${movieId}/videos?language=en-US`, options)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        //console.log(`Fetched trailers for movie ${movieId}:`, data)
        return data.results
    } catch (error) {
        //console.error(`Error fetching trailers for movie ${movieId}:`, error)
        return []
    }
}

export async function fetchWhereToWatch(movieId: string) {
    try {
        const response = await fetch(`${TMDB_BASE_URL}/movie/${movieId}/watch/providers`, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        //console.log(`Fetched watch providers for movie ${movieId}:`, data);
        return data.results.US || null; // Return US providers or null if not available
    } catch (error) {
        //console.error(`Error fetching watch providers for movie ${movieId}:`, error);
        return null;
    }
}

