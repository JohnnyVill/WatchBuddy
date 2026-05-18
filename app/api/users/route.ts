import { watchedMovie } from "@/app/lib/db";
import { getSession } from "../../lib/session";

export async function POST(request: Request) {
    try {
        const { completed, movieId } = await request.json();

        if (movieId == null) {
            return new Response(
                JSON.stringify({ message: "Movie ID is required." }),
                { status: 400 }
            );
        }

        const session = await getSession();
        if (!session) {
            return new Response(
                JSON.stringify({ message: "Authentication required." }),
                { status: 401 }
            );
        }

        await watchedMovie(session.userId, completed, movieId);
        return new Response(
            JSON.stringify({ message: "Added to watched." }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Watch status update failed:", error instanceof Error ? error.message : "Unknown error");
        return new Response(
            JSON.stringify({ message: "Failed to update watch status." }),
            { status: 500 }
        );
    }
}