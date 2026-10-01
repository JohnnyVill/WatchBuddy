import { getSession } from "@/app/lib/session";
import { getMovieById } from "@/app/lib/db";
import { fetchMovieDetails } from "@/app/lib/tmdb";
import { NextResponse } from "next/server";
export async function GET(request: Request) {
  const headers = { "Cache-Control": "private, no-store" };
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Log in to view your history." }, { status: 401, headers });
    const movieId = new URL(request.url).searchParams.get("movieId");
    if (movieId !== null && (!/^\d+$/.test(movieId) || !Number.isSafeInteger(Number(movieId)) || Number(movieId) < 1)) {
      return NextResponse.json({ message: "Invalid movie ID." }, { status: 400, headers });
    }
    const history = await getMovieById(session.userId);
    if (movieId !== null) return NextResponse.json({ watched: history.some((movie) => Number(movie.tmdb_id) === Number(movieId)) }, { headers });
    const movies = await Promise.all(history.map((movie) => fetchMovieDetails(String(movie.tmdb_id))));
    return NextResponse.json({ results: movies.filter((movie) => movie !== null) }, { headers });
  } catch (error) {
    console.error("History failed:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ message: "Your watch history couldn't load. Please try again." }, { status: 503, headers });
  }
}
