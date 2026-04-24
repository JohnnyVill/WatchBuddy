import { fetchPopularMovies, fetchTopRatedMovies, fetchNowPlayingMovies } from "./lib/tmdn" ;
import Home from "./components/homeUI";
export default async function Movies() {
    const popularMovies = await fetchPopularMovies()
    const topRatedMovies = await fetchTopRatedMovies()
    const nowPlayingMovies = await fetchNowPlayingMovies()
    return (
        <Home 
        popularMovies={popularMovies} 
        topRatedMovies={topRatedMovies} 
        nowPlayingMovies={nowPlayingMovies} 
        />
    )
}