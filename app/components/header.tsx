"use client";

import { useEffect, useState } from "react";
import { FilmSlate } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import LoginModal from "./loginModal";
import SignupModal from "./signUpModal";
import Logout from "./logout";

type HeaderProps = {
  activeSession?: string | false;
};

export default function Header({ activeSession }: HeaderProps) {
  const isLoggedIn = !!activeSession;
  const [scrolled, setScrolled] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogin = () => {
    router.refresh();
    setShowLoginModal(false);
  };

  const handleSignup = () => {
    router.refresh();
    setShowSignupModal(false);
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-border bg-background/80 backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a
            href="/"
            className="flex items-center gap-2.5 text-foreground no-underline"
          >
            <FilmSlate weight="fill" className="h-6 w-6 text-accent" />
            <span className="text-lg font-semibold tracking-tight">
              WatchBuddy
            </span>
          </a>

          {!isLoggedIn ? (
            <nav className="flex items-center gap-1">
              <button
                onClick={() => setShowLoginModal(true)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Log in
              </button>
              <button
                onClick={() => setShowSignupModal(true)}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-all hover:bg-accent/90 active:scale-[0.97]"
              >
                Sign up
              </button>
            </nav>
          ) : (
            <nav className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {activeSession}
              </span>
              <Logout />
            </nav>
          )}
        </div>
      </header>

      <LoginModal
        visible={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
      />

      <SignupModal
        visible={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSignup={handleSignup}
      />
    </>
  );
}
