"use client";

import { useState } from "react";
import Image from "next/image";

export default function WatchButton() {
    const [watched, setWatched] = useState(false);

    function handleClicked(){
        setWatched(true);
    }

    return(
    <div className="flex items-center justify-center">
        <button 
            className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg ${
                !watched &&"bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 active:scale-95"
            }`}
            onClick={handleClicked}
            disabled={watched}
        >
            <div className="flex items-center gap-2">
                {watched && <Image src="/checkmark.svg" alt="Watched" width={40} height={40} />}
                <span>{!watched && "Watched"}</span>
            </div>
        </button>
    </div>)
}