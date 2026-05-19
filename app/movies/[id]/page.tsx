import WatchButton from "@/app/components/watchButton";
import WatchProviders from "@/app/components/watchProviders";
import { fetchMovieDetails, fetchMovieTrailers } from "@/app/lib/tmdb";
import Image from "next/image";

export default async function MovieDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const movieDetails = await params;
  const movie = await fetchMovieDetails(movieDetails.id);
  const trailers = await fetchMovieTrailers(movieDetails.id);
  const hasTrailers =
    trailers.filter(
      (trailer: any) =>
        trailer.official &&
        trailer.site === "YouTube" &&
        trailer.type === "Trailer",
    ).length > 0;

  if (!movie) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <h1 className="text-2xl font-semibold text-foreground">
          Movie not found
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* Backdrop */}
      <div className="relative h-[50dvh] overflow-hidden">
        <Image
          src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/20" />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 md:py-12">
        <div className="flex flex-col gap-8 md:flex-row">
          {/* Poster */}
          <div className="mx-auto w-48 flex-shrink-0 md:mx-0 md:w-64">
            <div className="aspect-[2/3] overflow-hidden rounded-xl">
              <Image
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                width={300}
                height={450}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tighter md:text-4xl">
                {movie.title}
              </h1>
              {movie.tagline && (
                <p className="mt-1 text-muted-foreground">{movie.tagline}</p>
              )}
            </div>

            <p className="leading-relaxed text-muted-foreground">
              {movie.overview}
            </p>

            <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
              <div>
                <span className="text-muted">Release</span>
                <p className="font-medium">{movie.release_date}</p>
              </div>
              <div>
                <span className="text-muted">Rating</span>
                <p className="font-medium">
                  {Math.round(movie.vote_average * 10) / 10}/10
                </p>
              </div>
              <div>
                <span className="text-muted">Runtime</span>
                <p className="font-medium">{movie.runtime} min</p>
              </div>
              <div>
                <span className="text-muted">Genres</span>
                <p className="font-medium">
                  {movie.genres?.map((g: any) => g.name).join(", ")}
                </p>
              </div>
            </div>

            <WatchProviders params={movieDetails} />
            <WatchButton />
          </div>
        </div>

        {/* Trailers */}
        {hasTrailers && (
          <div className="mt-12">
            <h2 className="mb-6 text-2xl font-semibold tracking-tight">
              Trailers
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {trailers
                .filter(
                  (trailer: any) =>
                    trailer.official &&
                    trailer.site === "YouTube" &&
                    trailer.type === "Trailer",
                )
                .slice(0, 3)
                .map((trailer: any) => (
                  <div
                    key={trailer.id}
                    className="aspect-video overflow-hidden rounded-xl"
                  >
                    <iframe
                      src={`https://www.youtube.com/embed/${trailer.key}`}
                      title={trailer.name}
                      className="h-full w-full"
                      allowFullScreen
                    />
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
