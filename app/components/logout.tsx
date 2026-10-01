"use client";
import { useRef, useState } from "react";
import { useAuth } from "./authProvider";
export default function Logout() {
  const { signOut } = useAuth();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const inFlight = useRef(false);
  async function logout() {
    if (inFlight.current) return;
    inFlight.current = true; setPending(true); setError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Logout failed. Please try again.");
      signOut();
    } catch { setError("Couldn't log out. Try again."); }
    finally { inFlight.current = false; setPending(false); }
  }
  return <div className="relative">
    <button onClick={logout} className="button button-ghost" disabled={pending}>{pending ? "Logging out…" : "Log out"}</button>
    {error && <p role="alert" className="absolute right-0 top-full mt-2 w-52 rounded-lg border border-border bg-neutral-900 p-3 text-sm text-red-300">{error}</p>}
  </div>;
}
