import { fetchMovieData } from "./lib/movies";
import Home from "./components/homeUI";
export default async function Movies() {
  return <Home catalog={await fetchMovieData()} />;
}
