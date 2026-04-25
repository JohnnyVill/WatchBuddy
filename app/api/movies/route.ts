import { NextResponse } from "next/server";
import { fetchTmdbMovies } from "../../lib/tmdb";

const categoryEndpoints: Record<string, string> = {
  popular: "movie/popular",
  top_rated: "movie/top_rated",
  now_playing: "movie/now_playing",
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category");
  const page = Number(url.searchParams.get("page") || "1");

  if (!category || !categoryEndpoints[category]) {
    return NextResponse.json({ error: "Invalid category." }, { status: 400 });
  }

  const results = await fetchTmdbMovies(categoryEndpoints[category], page);
  return NextResponse.json({ results });
}
