import {fetchMovieData} from "./lib/api/movies" ;
import Home from "./components/homeUI";
export default async function Movies() {
    const data = await fetchMovieData()
    return (
        <Home 
        {...data}
        />
    )
}