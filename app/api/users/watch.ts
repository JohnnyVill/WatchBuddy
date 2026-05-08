//import {watchedMovie} from "@/app/lib/db";

export async function POST(request: Request) {
    try {
        const data = await request.json();
        console.log(data)
    } catch (error) {
        console.error("Error updating watch status:", error);

    }
}