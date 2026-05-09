import {watchedMovie} from "@/app/lib/db";
import { getSession } from "../../lib/session";

export async function POST(request: Request) {
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
        // const data = await request.json();
        // console.log(session)
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