"use client";

import { useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function WatchButton() {
    const [watched, setWatched] = useState(false);
    const params = useParams()

    // Load initial watched state
  useEffect(() => {
        async function loadWatchStatus() {
        try {
            const response = await fetch("/api/movies/watched");

            if (!response.ok) return;

            const data = await response.json();

            const isWatched = data.results.some(
            (movie: any) => movie.id.toString() === params.id
            );

            setWatched(isWatched);
        } catch (error) {
            console.error(error);
        }
        }
        loadWatchStatus();
    }, [params.id]);

    async function handleClicked(){
        const newWatch = !watched
        setWatched(!watched);

        try {
            const response = await fetch("/api/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    movieId: params.id,
                    completed: newWatch,
                }),
            });

            if (!response.ok) {
                // revert UI if failed
                setWatched(!newWatch);
                return;
            }

            const data = await response.json();

            console.log(data);
        } catch (error) {
            setWatched(!newWatch);

            console.error(error);
        }
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
                {watched && (<Image src="/checkmark.svg" alt="Watched" width={40} height={40} />)}
                <span>{!watched && "Watched"}</span>
            </div>
        </button>
    </div>)
}