import dotenv from "dotenv/config"

const TMDB_API_KEY = process.env.TMDB_API_KEY
const TMDB_BASE_URL = "https://api.themoviedb.org/3"
const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${TMDB_API_KEY}`
    }
}

export async function fetchTmdbMovies(endpoint: string) {
    try {
        const response = await fetch(`${TMDB_BASE_URL}/${endpoint}`, options)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        console.log(`Fetched ${endpoint}:`, data)
        return data
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error)
    }
}

export function fetchPopularMovies() {
    return fetchTmdbMovies("movie/popular")
}

export function fetchTopRatedMovies() {
    return fetchTmdbMovies("movie/top_rated")
}

export function fetchNowPlayingMovies() {
    return fetchTmdbMovies("movie/now_playing")
}