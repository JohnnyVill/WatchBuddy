import {getSession} from "../../../lib/session"
import { getMovieById } from "@/app/lib/db"
import {fetchMovieDetails} from "../../../lib/tmdb" 
import { NextResponse } from "next/server"

export async function GET(){
    const session = await getSession()

    const watchedMovies = await getMovieById(session?.userId||0)

    const movies = await Promise.all(watchedMovies? watchedMovies.map((movie) => fetchMovieDetails(movie.tmdb_id.toString())):"");
    // console.log("Movie watch history", movies)
    
    return NextResponse.json({
        results: movies.filter(Boolean),
    });
}