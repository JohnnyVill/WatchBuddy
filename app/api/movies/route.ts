import { NextResponse } from "next/server";
import { fetchTmdbMovies} from "../../lib/tmdb";
import { ratelimit } from "../../middleware";

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

  const { success, limit, remaining, reset } = await ratelimit.limit(`${ip}:movies:${category}`);

  if (!success) {
    return new NextResponse("Rate limit exceeded", {
      status: 429,
      headers: {
        "X-RateLimit-Limit": String(limit),
        "X-RateLimit-Remaining": String(remaining),
        "X-RateLimit-Reset": String(reset),
        "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
      },
    });
  }

  if (!category || !categoryEndpoints[category]) {
    return NextResponse.json({ error: "Invalid category." }, { status: 400 });
  }

  const results = await fetchTmdbMovies(categoryEndpoints[category], page);
  return NextResponse.json({ results });
}
