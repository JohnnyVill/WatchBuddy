import { NextResponse } from "next/server";
import { fetchTmdbMovies } from "../../lib/tmdb";
import { isCategory } from "../../lib/catalog";
export async function GET(request: Request) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category");
  const page = Number(url.searchParams.get("page") ?? "1");
  if (!isCategory(category) || !Number.isInteger(page) || page < 1 || page > 500) {
    return NextResponse.json({ message: "Choose a valid category and page (1–500)." }, { status: 400 });
  }
  try { return NextResponse.json(await fetchTmdbMovies(category, page)); }
  catch { return NextResponse.json({ message: "Movies couldn't load. Please try again." }, { status: 502 }); }
}
