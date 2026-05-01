import { fetchPopularMovies, fetchTopRatedMovies, fetchNowPlayingMovies, fetchUpcomingMovies } from "./tmdb" ;
import { testDbConnection } from "./db";

export async function fetchMovieData(){
    await testDbConnection();
    const [popularMovies,topRatedMovies,nowPlayingMovies,upcomingMovies] = await Promise.all([
        fetchPopularMovies(),
        fetchTopRatedMovies(),
        fetchNowPlayingMovies(),
        fetchUpcomingMovies()
    ])
    const filteredMovies = upcomingMovies.filter((movie: any) => {
        const releaseDate = new Date(movie.release_date);
        const today = new Date();
        return releaseDate >= today;
    });

    return {
        popularMovies, topRatedMovies, nowPlayingMovies, upcomingMovies: filteredMovies
    }
}