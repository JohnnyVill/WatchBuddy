import { NextResponse } from "next/server";
import { watchedMovie } from "@/app/lib/db";
import { getSession } from "@/app/lib/session";
import { validateWatchUpdate } from "@/app/lib/validation";
export async function POST(request: Request) {
  try {
    const update = validateWatchUpdate(await request.json().catch(() => null));
    if (!update) return NextResponse.json({ message: "A valid movie ID and watched status are required." }, { status: 400 });
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Log in to track your movies." }, { status: 401 });
    await watchedMovie(session.userId, update.completed, update.movieId);
    return NextResponse.json({ message: update.completed ? "Marked as watched." : "Removed from watched." });
  } catch (error) {
    console.error("Watch update failed:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ message: "Your change couldn't be saved. Please try again." }, { status: 500 });
  }
}
