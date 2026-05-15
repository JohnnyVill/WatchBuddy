
import { NextResponse } from "next/server";
import { fetchTmdbMovies, ratelimit } from "../../lib/tmdb";

const categoryEndpoints: Record<string, string> = {
  popular: "movie/popular",
  top_rated: "movie/top_rated",
  now_playing: "movie/now_playing",
  upcoming: "movie/upcoming",
};

export async function GET(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const url = new URL(request.url);
  const category = url.searchParams.get("category");
  const page = Number(url.searchParams.get("page") || "1");
  const ip = forwardedFor
    ? forwardedFor.split(",")[0] 
    : "anonymous";
  const { success } = await ratelimit.limit(`${ip}:movies:${category}`);
  if(!success) {
    return new NextResponse("Rate limit exceeded", { status: 429 })
  }

  if (!category || !categoryEndpoints[category]) {
    return NextResponse.json({ error: "Invalid category." }, { status: 400 });
  }

  const results = await fetchTmdbMovies(categoryEndpoints[category], page);
  return NextResponse.json({ results });
}
