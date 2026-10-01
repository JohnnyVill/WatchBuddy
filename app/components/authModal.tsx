"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Eye, EyeSlash, X } from "@phosphor-icons/react";
type Props = {
  mode: "login" | "signup";
  onClose: () => void;
  onSwitch: (mode: "login" | "signup") => void;
  onSuccess: (username: string) => void;
};
export default function AuthModal({ mode, onClose, onSwitch, onSuccess }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inFlight = useRef(false);
  const signup = mode === "signup";
  useEffect(() => {
    const dialog = dialogRef.current;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    dialog?.querySelector<HTMLInputElement>("input")?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (inFlight.current) return;
    if (new TextEncoder().encode(password).length > 72) {
      setError("Use a password with no more than 72 bytes."); return;
    }
    inFlight.current = true;
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.message || "Something went wrong. Please try again.");
        return;
      }
      onSuccess(username.trim());
    } catch { setError("Couldn't connect. Check your connection and try again."); }
    finally { inFlight.current = false; setSubmitting(false); }
  }
  return (
    <dialog ref={dialogRef} aria-labelledby="auth-title" aria-describedby="auth-description"
      className="auth-dialog"
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = event.currentTarget.querySelectorAll<HTMLElement>("button:not(:disabled), input:not(:disabled), a[href], [tabindex='0']");
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }}
      onCancel={(event) => { event.preventDefault(); if (!submitting) onClose(); }}
      onClick={(event) => {
        if (event.target !== event.currentTarget || submitting) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
      }}>
      <div className="mb-7 flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Your movie life, remembered</p>
          <h2 id="auth-title" className="text-2xl font-semibold tracking-tight">{signup ? "Make yourself at home" : "Welcome back"}</h2>
        </div>
        <button type="button" className="icon-button shrink-0" aria-label="Close dialog" onClick={onClose} disabled={submitting}><X size={20} /></button>
      </div>
      <p id="auth-description" className="mb-6 text-sm leading-relaxed text-muted-foreground">
        {signup ? "Create an account to keep track of the movies you've watched." : "Log in to pick up where you left off and track your movies."}
      </p>
      <form onSubmit={submit} className="space-y-5" aria-busy={submitting}>
        {error && <p role="alert" id="auth-error" className="notice notice-error">{error}</p>}
        <div className="space-y-2">
          <label htmlFor="auth-username" className="text-sm font-medium">Username</label>
          <input id="auth-username" name="username" className="input" value={username}
            onChange={(event) => setUsername(event.target.value)} autoComplete="username"
            placeholder={signup ? "Choose a username" : "Your username"} required maxLength={100} disabled={submitting} />
        </div>
        <div className="space-y-2">
          <label htmlFor="auth-password" className="text-sm font-medium">Password</label>
          <div className="relative">
            <input id="auth-password" name="password" className="input pr-12" type={showPassword ? "text" : "password"}
              value={password} onChange={(event) => setPassword(event.target.value)}
              autoComplete={signup ? "new-password" : "current-password"} required disabled={submitting}
              aria-describedby={error ? "auth-error" : undefined} placeholder={signup ? "Create a password" : "Your password"} />
            <button type="button" className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}
              onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}</button>
          </div>
        </div>
        <button type="submit" className="button button-primary w-full" disabled={submitting}>
          {submitting ? (signup ? "Creating account…" : "Logging in…") : (signup ? "Create account" : "Log in")}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {signup ? "Already have an account? " : "New to WatchBuddy? "}
        <button type="button" className="font-medium text-foreground underline decoration-neutral-600 underline-offset-4" disabled={submitting}
          onClick={() => onSwitch(signup ? "login" : "signup")}>{signup ? "Log in" : "Create an account"}</button>
      </p>
    </dialog>
  );
}
