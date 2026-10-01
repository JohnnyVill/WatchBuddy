"use client";
import Image from "next/image";
import { useState } from "react";
import { FilmSlate } from "@phosphor-icons/react";
export default function MovieImage({ path, title, backdrop = false, priority = false }: {
  path: string | null; title: string; backdrop?: boolean; priority?: boolean;
}) {
  const [failedPath, setFailedPath] = useState<string | null>(null);
  if (!path || path === failedPath) return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-neutral-900 px-4 text-center text-muted-foreground">
      <FilmSlate size={32} weight="light" aria-hidden="true" />
      {!backdrop && <span className="text-xs">Poster unavailable</span>}
    </div>
  );
  return <Image src={`https://image.tmdb.org/t/p/${backdrop ? "w1280" : "w500"}${path}`}
    alt={backdrop ? "" : `${title} poster`} fill priority={priority} draggable={false}
    sizes={backdrop ? "100vw" : "(min-width: 768px) 208px, 152px"}
    className="object-cover" onError={() => setFailedPath(path)} />;
}
