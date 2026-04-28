import { fetchMovieDetails, fetchMovieTrailers } from "@/app/lib/tmdb";
import Image from "next/image";

export default async function MovieDetailsPage({params}: {params: {id: string}}){
    const movieDetails = await params;
   
    const movie = await fetchMovieDetails(movieDetails.id);
    const trailers = await fetchMovieTrailers(movieDetails.id);
    const hasTrailers = trailers.filter((trailer: any) => trailer.official && trailer.site === "YouTube" && trailer.type === "Trailer").length > 0? true : false;


    if (!movie) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <h1 className="text-2xl">Movie not found</h1>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-9/10 mx-auto">
                <div className="relative flex flex-col md:flex-row gap-8">
                    <div className="absolute inset-0 z-0">
                        <Image
                            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                            alt={movie.title}
                            fill
                            className="object-cover opacity-30 blur-sm"
                        />
                    </div>
                    <div className="flex-shrink-0">
                        <Image
                            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                            alt={movie.title}
                            width={300}
                            height={450}
                            className="rounded-lg"
                        />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>
                        <p className="text-lg mb-4">{movie.overview}</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <strong>Release Date:</strong> {movie.release_date}
                            </div>
                            <div>
                                <strong>Rating:</strong> {movie.vote_average}/10
                            </div>
                            <div>
                                <strong>Runtime:</strong> {movie.runtime} minutes
                            </div>
                            <div>
                                <strong>Genres:</strong> {movie.genres?.map((g: any) => g.name).join(", ")}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-8">
                    {hasTrailers &&
                    <div> 
                    <h2 className="text-2xl font-bold mb-4">Trailers</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {trailers.filter((trailer: any) => trailer.official && trailer.site === "YouTube" && trailer.type === "Trailer").map((trailer: any) => (
                            <div key={trailer.id} className="aspect-video">
                                <iframe
                                    src={`https://www.youtube.com/embed/${trailer.key}`}
                                    title={trailer.name}
                                    className="w-full h-full"
                                    allowFullScreen
                                />
                            </div>
                        ))}
                    </div>
                    </div>}
                </div>
            </div>
        </div>
    );
}