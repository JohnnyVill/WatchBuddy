"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { MagnifyingGlass } from "@phosphor-icons/react";

export default function SearchForm() {
  const router = useRouter();
  const params = useSearchParams();
  const query = params.get("q") ?? "";
  return <form role="search" className="relative w-full" onSubmit={(event) => {
    event.preventDefault();
    const value = String(new FormData(event.currentTarget).get("q") ?? "").trim();
    if (value) router.push(`/search?${new URLSearchParams({ q: value })}`);
  }}>
    <label htmlFor="movie-search" className="sr-only">Search movies</label>
    <input key={query} id="movie-search" name="q" type="search" defaultValue={query}
      placeholder="Search movies…" className="input pr-14" />
    <button type="submit" aria-label="Search movies"
      className="absolute right-1 top-1 flex h-10 w-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-neutral-800 hover:text-foreground">
      <MagnifyingGlass size={20} aria-hidden="true" />
    </button>
  </form>;
}
