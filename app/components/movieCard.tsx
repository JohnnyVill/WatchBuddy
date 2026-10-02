import Link from "next/link";
import { Star } from "@phosphor-icons/react/dist/ssr";
import MovieImage from "./movieImage";
import type { Movie } from "../lib/types";

export default function MovieCard({ movie, grid = false }: { movie: Movie; grid?: boolean }) {
  return <Link href={`/movies/${movie.id}`} className={`movie-card group block ${grid ? "min-w-0 w-full" : "w-[152px] shrink-0 snap-start md:w-[192px]"}`}>
    <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-white/5 bg-neutral-900">
      <MovieImage path={movie.poster_path} title={movie.title} />
    </div>
    <h3 className="mt-3 line-clamp-2 text-sm font-medium leading-5 group-hover:text-white">{movie.title}</h3>
    <div className="mt-1.5 flex items-center justify-between gap-2 text-xs text-muted-foreground">
      <span>{movie.release_date?.slice(0, 4) || "Release TBD"}</span>
      <span className="flex items-center gap-1"><Star size={12} weight="fill" className="text-amber-400" aria-hidden="true" />
        <span aria-label={movie.vote_average > 0 ? `Rated ${movie.vote_average.toFixed(1)} out of 10` : "Not yet rated"}>
          {movie.vote_average > 0 ? movie.vote_average.toFixed(1) : "Not rated"}
        </span>
      </span>
    </div>
  </Link>;
}
