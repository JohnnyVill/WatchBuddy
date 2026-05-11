import {getSession} from "../../lib/session"
import { getMovieById } from "@/app/lib/db" 


export async function GET(){
    const watchedList = []
    const session = await getSession()

    const watchedMovies = await getMovieById(session?.userId||0)

 
    console.log("Movie watch history", watchedMovies)
}