import {getSession} from "../../../lib/session"
import { getMovieById } from "@/app/lib/db"
import {fetchMovieDetails} from "../../../lib/tmdb" 
import { NextResponse } from "next/server"
import { ratelimit } from "../../../lib/tmdb"

export async function GET(request:Request){
    const forwardedFor = request.headers.get("x-forwarded-for")

    const ip = forwardedFor
    ? forwardedFor.split(",")[0] 
    : "anonymous"

    const {success} = await ratelimit.limit(`${ip}:watchedMovies`)
    
    if(!success) {
        return new NextResponse("Rate limit exceeded", { status: 429 })
    }

    const session = await getSession()

    const watchedMovies = await getMovieById(session?.userId||0)

    const movies = await Promise.all(watchedMovies? watchedMovies.map((movie) => fetchMovieDetails(movie.tmdb_id.toString())):[]);
    // console.log("Movie watch history", movies)
    
    return NextResponse.json({
        results: movies.filter(Boolean),
    });
}