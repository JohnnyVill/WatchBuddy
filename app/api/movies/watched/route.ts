import {getSession} from "../../../lib/session"
import { getMovieById } from "@/app/lib/db"
import {fetchMovieDetails} from "../../../lib/tmdb"
import { NextResponse } from "next/server"
import { ratelimit } from "../../../middleware";

export async function GET(request:Request){
    const forwardedFor = request.headers.get("x-forwarded-for")

    const ip = forwardedFor
    ? forwardedFor.split(",")[0]
    : "anonymous"

    const { success, limit, remaining, reset } = await ratelimit.limit(`${ip}:watchedMovies`)

    if (!success) {
        return new NextResponse("Rate limit exceeded", {
            status: 429,
            headers: {
                "X-RateLimit-Limit": String(limit),
                "X-RateLimit-Remaining": String(remaining),
                "X-RateLimit-Reset": String(reset),
                "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
            },
        })
    }

    const session = await getSession()

    const watchedMovies = await getMovieById(session?.userId||0)

    const movies = await Promise.all(watchedMovies? watchedMovies.map((movie) => fetchMovieDetails(movie.tmdb_id.toString())):[]);

    return NextResponse.json({
        results: movies.filter(Boolean),
    });
}
