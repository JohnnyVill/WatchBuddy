
const TMDB_API_KEY = process.env.TMDB_API_KEY

const TMDB_BASE_URL = "https://api.themoviedb.org/3"
const options = {
    method: 'GET',
    headers: {
        Authorization: `Bearer ${TMDB_API_KEY}`,
    }
}

export async function fetchTmdbMovies(endpoint: string, page = 1) {
    try {
        const response = await fetch(`${TMDB_BASE_URL}/${endpoint}?language=en-US&page=${page}`, options)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        console.log(`Fetched ${endpoint} page ${page}:`, data)
        return data.results
    } catch (error) {
        console.error(`Error fetching ${endpoint} page ${page}:`, error)
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

export async function fetchMovieDetails(movieId: string) {
    try {
        const response = await fetch(`${TMDB_BASE_URL}/movie/${movieId}?language=en-US`, options)
        if(!response.ok) {
            throw new Error(`Http error! status: ${response.status}`)
        }
        const data = await response.json()
        console.log(`Fetched details for movie ${movieId}:`, data)
        return data
    } catch (error) {
        console.error(`Error fetching details for movie ${movieId}:`, error)
        return null
    }
}