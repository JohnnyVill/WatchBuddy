'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Logout() {
    const router = useRouter();
    const [error, setError] = useState("");

    async function handleLogout() {
        setError("");
        try {
            const response = await fetch("/api/auth/logout", {
                method: "POST",
            });
            if (!response.ok) {
                setError("Logout failed. Please try again.");
                return;
            }
            router.refresh();
        } catch {
            setError("Network error. Please try again.");
        }
    }

    return (
        <div className="flex items-center gap-2">
            {error && <span className="text-sm text-red-400">{error}</span>}
            <button onClick={handleLogout} className="hover:text-gray-300">
                Logout
            </button>
        </div>
    );
}
