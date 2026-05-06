'use client';
import { useRouter } from "next/navigation";
export default function Logout() {
    const router = useRouter();
    async function handleLogout() {
        const response = await fetch("/api/auth/logout", {
            method: "POST",
        });
        if (!response.ok) {
            alert("Logout failed. Please try again.");
            return;
        }
        router.refresh()
    }
    return(
        <button onClick={handleLogout} className="hover:text-gray-300">
            Logout
        </button>
    );
}