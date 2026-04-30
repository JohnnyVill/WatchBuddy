import { fetchPopularMovies, fetchTopRatedMovies, fetchNowPlayingMovies, fetchUpcomingMovies } from "./tmdb" ;

export async function fetchMovieData(){
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