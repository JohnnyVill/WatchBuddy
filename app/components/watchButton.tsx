"use client";
import { useEffect, useRef, useState } from "react";
import { CheckCircle, PlusCircle } from "@phosphor-icons/react";
import { useAuth } from "./authProvider";
export default function WatchButton({ movieId }: { movieId: number }) {
  return <WatchControl key={movieId} movieId={movieId} />;
}
function WatchControl({ movieId }: { movieId: number }) {
  const { username, requestAuth } = useAuth();
  const [watchState, setWatchState] = useState({ username, watched: false, ready: !username });
  const watched = watchState.username === username && !!username && watchState.watched;
  const loading = !!username && (watchState.username !== username || !watchState.ready);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [version, setVersion] = useState(0);
  const inFlight = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    const controller = new AbortController();
    if (username) {
      void (async () => {
        try {
          const response = await fetch(`/api/movies/watched?movieId=${movieId}`, { cache: "no-store", signal: controller.signal });
          if (response.status === 401) {
            if (!controller.signal.aborted) {
              setWatchState({ username, watched: false, ready: true });
              setError("Your session has ended. Log in to continue.");
            }
            return;
          }
          if (!response.ok) throw new Error("Status unavailable");
          const data: { watched: boolean } = await response.json();
          if (!controller.signal.aborted && !inFlight.current) {
            setWatchState({ username, watched: data.watched, ready: true });
            setError((current) => current.startsWith("Your change") ? current : "");
          }
        } catch {
          if (!controller.signal.aborted) {
            setWatchState({ username, watched: false, ready: true });
            setError("Couldn't check your watched status. Please try again.");
          }
        }
      })();
    }
    return () => { mounted.current = false; controller.abort(); };
  }, [username, movieId, version]);
  async function save(completed: boolean) {
    if (inFlight.current) return;
    inFlight.current = true;
    const previous = watchState;
    setWatchState({ username, watched: completed, ready: true });
    setSaving(true); setError(""); setStatus("");
    try {
      const response = await fetch("/api/users", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId, completed }),
      });
      if (response.status === 401) {
        if (mounted.current) { setWatchState(previous); setStatus("Log in to save this movie."); }
        requestAuth(() => save(completed));
        return;
      }
      if (!response.ok) throw new Error("Save failed");
      window.dispatchEvent(new Event("watch-history-changed"));
      if (mounted.current) setStatus(completed ? "Added to your watch history." : "Removed from your watch history.");
    } catch {
      if (mounted.current) { setWatchState(previous); setError("Your change couldn't be saved. Please try again."); }
    } finally {
      inFlight.current = false;
      if (mounted.current) {
        setSaving(false);
        // Reconcile both successes and rollbacks with the current account after login.
        setVersion((value) => value + 1);
      }
    }
  }
  function click() {
    if (!username || error.startsWith("Your session")) { requestAuth(() => save(true)); return; }
    void save(!watched);
  }
  const statusUnavailable = error.startsWith("Couldn't check");
  return <div className="space-y-3">
    <button type="button" className={`button min-w-56 ${watched ? "button-secondary" : "button-primary"}`}
      disabled={loading || saving || statusUnavailable} aria-pressed={watched} aria-busy={loading || saving} onClick={click}>
      {watched ? <CheckCircle size={20} weight="fill" aria-hidden="true" /> : <PlusCircle size={20} aria-hidden="true" />}
      {saving ? "Saving…" : loading ? "Checking watched status…" : watched ? "Watched — undo" : "Mark as watched"}
    </button>
    {!username && <p className="text-xs text-muted-foreground">Log in when you&apos;re ready to save your history.</p>}
    {error && <div className="flex flex-wrap items-center gap-3">
      <p role="alert" className="text-sm text-red-300">{error}</p>
      {statusUnavailable && <button className="button button-secondary" onClick={() => { setWatchState({ username, watched, ready: false }); setError(""); setVersion((value) => value + 1); }}>Try again</button>}
    </div>}
    <p role="status" aria-live="polite" className="min-h-5 text-sm text-muted-foreground">{status}</p>
  </div>;
}
