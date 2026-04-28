import { fetchMovieDetails } from "@/app/lib/tmdb";
import Image from "next/image";

export default async function MovieDetailsPage({params}: {params: {id: string}}){
    const movieDetails = await params;
   
    const movie = await fetchMovieDetails(movieDetails.id);

    if (!movie) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <h1 className="text-2xl">Movie not found</h1>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-shrink-0">
                        <Image
                            src={`https://image.tmdb.org/t/p/w500${movie.belongs_to_collection?.backdrop_path || movie.poster_path}`}
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
            </div>
        </div>
    );
}