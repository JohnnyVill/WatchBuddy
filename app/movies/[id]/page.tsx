import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Star, Play } from "@phosphor-icons/react/dist/ssr";
import WatchButton from "@/app/components/watchButton";
import WatchProviders from "@/app/components/watchProviders";
import MovieImage from "@/app/components/movieImage";
import { fetchMovieDetails, fetchMovieTrailers, fetchWhereToWatch } from "@/app/lib/tmdb";
export default async function MovieDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id) || !Number.isSafeInteger(Number(id)) || Number(id) <= 0) notFound();
  const [movie, trailerResult, providerResult] = await Promise.all([
    fetchMovieDetails(id),
    fetchMovieTrailers(id).then((results) => ({ results, failed: false })).catch(() => ({ results: [], failed: true })),
    fetchWhereToWatch(id).then((availability) => ({ availability, failed: false })).catch(() => ({ availability: null, failed: true })),
  ]);
  if (!movie) notFound();
  const trailers = trailerResult.results.filter((trailer) => trailer.official && trailer.site === "YouTube" && trailer.type === "Trailer").slice(0, 3);
  const release = movie.release_date ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(movie.release_date)) : "To be announced";
  return <>
    <div className="relative h-[25dvh] min-h-40 max-h-80 overflow-hidden sm:h-[35dvh]">
      <MovieImage path={movie.backdrop_path} title={movie.title} backdrop priority />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-background/10" />
    </div>
    <div className="relative mx-auto -mt-12 max-w-7xl px-4 pb-16 sm:px-6">
      <Link href="/#browse" className="button button-secondary mb-6"><ArrowLeft size={16} aria-hidden="true" /> Back to browse</Link>
      <div className="flex flex-col gap-7 md:flex-row md:gap-10">
        <div className="flex items-start gap-5 md:block">
          <div className="relative aspect-[2/3] w-28 shrink-0 overflow-hidden rounded-xl border border-border sm:w-40 md:w-52">
            <MovieImage path={movie.poster_path} title={movie.title} priority />
          </div>
          <div className="md:hidden">
            <p className="eyebrow mb-2">Movie details</p>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{movie.title}</h1>
            {movie.tagline && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{movie.tagline}</p>}
          </div>
        </div>
        <div className="min-w-0 flex-1 space-y-7">
          <div className="hidden md:block">
            <p className="eyebrow mb-2">Movie details</p>
            <h1 className="text-4xl font-semibold tracking-tight">{movie.title}</h1>
            {movie.tagline && <p className="mt-2 text-muted-foreground">{movie.tagline}</p>}
          </div>
          <dl className="grid grid-cols-2 gap-x-5 gap-y-4 border-y border-border py-5 text-sm sm:grid-cols-4">
            <div><dt className="text-xs text-muted-foreground">Release date</dt><dd className="mt-1.5 font-medium">{release}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Audience rating</dt><dd className="mt-1.5 flex items-center gap-1.5 font-medium"><Star size={16} weight="fill" className="text-amber-400" aria-hidden="true" />{movie.vote_average > 0 ? `${movie.vote_average.toFixed(1)} / 10` : "Not yet rated"}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Runtime</dt><dd className="mt-1.5 font-medium">{movie.runtime ? `${movie.runtime} min` : "Not listed"}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Genres</dt><dd className="mt-1.5 font-medium">{movie.genres?.map((genre) => genre.name).join(", ") || "Not listed"}</dd></div>
          </dl>
          <p className="max-w-3xl leading-relaxed text-muted-foreground">{movie.overview || "A synopsis isn't available for this movie yet."}</p>
          <WatchButton movieId={movie.id} />
          <WatchProviders availability={providerResult.availability} failed={providerResult.failed} />
        </div>
      </div>
      {trailerResult.failed && <p className="mt-10 text-sm text-muted-foreground">Trailers couldn&apos;t load. Refresh this page to try again.</p>}
      {trailers.length > 0 && <section className="mt-12 border-t border-border pt-8" aria-labelledby="trailers-title">
        <h2 id="trailers-title" className="mb-5 flex items-center gap-2 text-2xl font-semibold tracking-tight"><Play size={22} aria-hidden="true" /> Trailers</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {trailers.map((trailer) => <div key={trailer.id} className="space-y-2">
            <div className="aspect-video overflow-hidden rounded-xl bg-neutral-900">
              <iframe src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(trailer.key)}`} title={trailer.name} loading="lazy" className="h-full w-full" allowFullScreen />
            </div>
            <p className="text-sm text-muted-foreground">{trailer.name}</p>
          </div>)}
        </div>
      </section>}
    </div>
  </>;
}
