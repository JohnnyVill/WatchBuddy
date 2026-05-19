"use client";

import {
  useState,
  useRef,
  useEffect,
  type FormEvent,
} from "react";
import { X } from "@phosphor-icons/react";

type LoginModalProps = {
  visible: boolean;
  onClose: () => void;
  onLogin: () => void;
};

export default function LoginModal({
  visible,
  onClose,
  onLogin,
}: LoginModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus first input on open, reset on close
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
    setUsername("");
    setPassword("");
    setLoginError("");
    setSubmitting(false);
  }, [visible]);

  // Escape to close
  useEffect(() => {
    const handleEscape = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape" && visible) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [visible, onClose]);

  if (!visible) return null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoginError("");

    if (!username || !password) {
      setLoginError("Please enter both username and password.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setLoginError(
          errorData.message || "Login failed. Please try again.",
        );
        return;
      }

      onLogin();
      setUsername("");
      setPassword("");
    } catch {
      setLoginError(
        "Unable to connect. Please check your internet connection.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-border bg-neutral-900 p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Log in</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-neutral-800 hover:text-foreground"
            aria-label="Close"
          >
            <X weight="bold" className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {loginError && (
            <p className="text-sm text-red-400" role="alert">
              {loginError}
            </p>
          )}

          <div className="space-y-1.5">
            <label
              htmlFor="login-username"
              className="text-sm font-medium text-muted-foreground"
            >
              Username
            </label>
            <input
              ref={inputRef}
              id="login-username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value.trim())}
              className="w-full rounded-lg border border-border bg-neutral-800 px-3 py-2.5 text-sm text-foreground placeholder:text-muted transition-colors focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              required
              autoComplete="username"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="login-password"
              className="text-sm font-medium text-muted-foreground"
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value.trim())}
              className="w-full rounded-lg border border-border bg-neutral-800 px-3 py-2.5 text-sm text-foreground placeholder:text-muted transition-colors focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-white transition-all hover:bg-accent/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Signing in..." : "Log in"}
          </button>
        </form>
      </div>
    </div>
  );
}
