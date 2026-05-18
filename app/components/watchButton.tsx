"use client";

import { useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function WatchButton() {
    const [watched, setWatched] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const params = useParams();

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
                console.error("Failed to load watch status:", error instanceof Error ? error.message : "Unknown error");
            }
        }
        loadWatchStatus();
    }, [params.id]);

    async function handleClicked() {
        const newWatch = !watched;
        setWatched(!watched);
        setError(null);

        try {
            const response = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ movieId: params.id, completed: newWatch }),
            });

            if (!response.ok) {
                setError("Failed to update. Please try again.");
                setWatched(!newWatch);
                return;
            }

            const data = await response.json();
            console.log(data);
        } catch (error) {
            setWatched(!newWatch);
            setError("Network error. Please try again.");
            console.error("Watch toggle failed:", error instanceof Error ? error.message : "Unknown error");
        }
    }

    return (
        <div className="flex flex-col items-center justify-center gap-2">
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
                className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg ${
                    !watched && "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 active:scale-95"
                }`}
                onClick={handleClicked}
            >
                <div className="flex items-center gap-2">
                    {watched && <Image src="/checkmark.svg" alt="Watched" width={40} height={40} />}
                    <span>{!watched && "Watched"}</span>
                </div>
            </button>
        </div>
    );
}
