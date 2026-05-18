import { getSession } from "../../../lib/session";
import { getMovieById } from "@/app/lib/db";
import { fetchMovieDetails } from "../../../lib/tmdb";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ results: [] });
  }

  try {
    const watchedMovies = await getMovieById(session.userId);
    const movies = await Promise.all(
      (watchedMovies ?? []).map((movie) => fetchMovieDetails(movie.tmdb_id.toString()))
    );
    return NextResponse.json({ results: movies.filter(Boolean) });
  } catch (error) {
    console.error("Failed to load watched movies:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ results: [] });
  }
}