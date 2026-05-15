import {watchedMovie} from "@/app/lib/db";
import { getSession } from "../../lib/session";
import { ratelimit } from "../../middleware";

export async function POST(request: Request) {
    const forwardedFor = request.headers.get("x-forwarded-for")
    const ip = forwardedFor?.split(",")[0] ?? "anonymous"

    const { success, limit, remaining, reset } = await ratelimit.limit(`${ip}:users:watch`)

    if (!success) {
        return new Response(
            JSON.stringify({ message: "Too many requests" }),
            {
                status: 429,
                headers: {
                    "X-RateLimit-Limit": String(limit),
                    "X-RateLimit-Remaining": String(remaining),
                    "X-RateLimit-Reset": String(reset),
                    "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
                },
            }
        )
    }

    try {
        const {completed, movieId} = await request.json()
        if(!movieId){
            return new Response(
                JSON.stringify({message:"Something went wrong in getting completed information"}),
                {status:400}
            )
        }
        console.log(movieId)
        const session = await getSession()
        if(session){
            const userId = session.userId
           await watchedMovie(userId,completed,movieId)
            return new Response(
                JSON.stringify({ message:"added to watched"}),
                {status:200},
            )
        }else{
            console.error("Problem in getting user session")
        }
    } catch (error) {
        console.error("Error updating watch status:", error);
    }
}
