import { fetchPopularMovies, fetchTopRatedMovies, fetchNowPlayingMovies } from "../tmdb" ;

export async function fetchMovieData(){
    const [popularMovies,topRatedMovies,nowPlayingMovies] = await Promise.all([
        fetchPopularMovies(),
        fetchTopRatedMovies(),
        fetchNowPlayingMovies()
    ])
   

    return {
        popularMovies, topRatedMovies, nowPlayingMovies
    }
}