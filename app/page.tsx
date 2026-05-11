import {fetchMovieData} from "./lib/movies" ;
import {getSession} from "./lib/session";
import Home from "./components/homeUI";
export default async function Movies() {

    const session = await getSession();
    const data = await fetchMovieData() 
    return (
        <Home 
        activeSession={session ? session.username : false}
        {...data}
        />
    )
}