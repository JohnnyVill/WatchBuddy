"use client";

import { useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";

export default function WatchButton() {
    const [watched, setWatched] = useState(false);
    const params = useParams()
    function handleClicked(){
        setWatched(!watched);
        let newWatch = !watched
        async function watchList(){
            const movieId =  params.id
            try{
                const response = await fetch("/api/users",{
                    method:"POST",
                    headers:{
                        "Content-Type" : "application/json"
                    },
                    body:JSON.stringify({
                        movieId,
                        completed: newWatch
                    })
                })
                if(!response.ok){
                    console.error("error", response)
                    return
                }
                const data = await response.json()
                console.log(data)
                return data
            }
            catch(error){
                console.log("Error occured in fetch",error)
            }
    
        }
     
        console.log(watchList())
    }

    return(
    <div className="flex items-center justify-center">
        <button 
            className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg ${
                !watched &&"bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 active:scale-95"
            }`}
            onClick={handleClicked}
        >
            <div className="flex items-center gap-2">
                {watched && <Image src="/checkmark.svg" alt="Watched" width={40} height={40} />}
                <span>{!watched && "Watched"}</span>
            </div>
        </button>
    </div>)
}