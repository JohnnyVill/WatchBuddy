"use client";
import Link from "next/link";
import { FilmSlate } from "@phosphor-icons/react";
import { useAuth } from "./authProvider";
import Logout from "./logout";
import { Suspense } from "react";
import SearchForm from "./searchForm";
export default function Header() {
  const { username, requestAuth } = useAuth();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:flex-nowrap">
        <Link href="/" className="flex min-h-11 items-center gap-2 text-foreground">
          <FilmSlate weight="fill" size={26} className="text-accent" aria-hidden="true" />
          <span className="text-base font-semibold tracking-tight sm:text-lg">WatchBuddy</span>
        </Link>
        <div className="order-3 w-full lg:order-none lg:min-w-0 lg:max-w-md lg:flex-1">
          <Suspense fallback={<div className="h-12 rounded-lg border border-border bg-neutral-900" />}><SearchForm /></Suspense>
        </div>
        <nav aria-label="Main navigation" className="flex shrink-0 items-center gap-1 sm:gap-3">
          <Link href="/#browse" className="button button-ghost hidden sm:inline-flex">Browse</Link>
          {username ? <>
            <Link href="/#history" className="button button-ghost">History</Link>
            <span className="hidden max-w-28 truncate text-sm text-muted-foreground lg:inline" title={username}>{username}</span>
            <Logout />
          </> : <>
            <button className="button button-ghost" onClick={() => requestAuth()}>Log in</button>
            <button className="button button-primary" onClick={() => requestAuth(undefined, "signup")}>Sign up</button>
          </>}
        </nav>
      </div>
    </header>
  );
}
