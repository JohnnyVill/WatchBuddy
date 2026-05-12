import Image from "next/image";
import { useState, type MouseEvent, type UIEvent } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


type HomeProps = {
  popularMovies: any[];
  topRatedMovies: any[];
  nowPlayingMovies: any[];
  upcomingMovies: any[];
  isLoggedIn: boolean;
};

type CategoryKey = "popular" | "top_rated" | "now_playing" | "upcoming";

export default function HomeRows({ popularMovies: initialPopular, topRatedMovies: initialTopRated, nowPlayingMovies: initialNowPlaying, upcomingMovies: initialUpcoming, isLoggedIn }: HomeProps) {
  const router = useRouter();
  const [popular, setPopular] = useState(initialPopular ?? []);
  const [topRated, setTopRated] = useState(initialTopRated ?? []);
  const [nowPlaying, setNowPlaying] = useState(initialNowPlaying ?? []);
  const [upcoming, setUpcoming] = useState(initialUpcoming ?? []);

  const [popularPage, setPopularPage] = useState(1);
  const [topRatedPage, setTopRatedPage] = useState(1);
  const [nowPlayingPage, setNowPlayingPage] = useState(1);
  const [upcomingPage, setUpcomingPage] = useState(1);

  const [popularLoading, setPopularLoading] = useState(false);
  const [topRatedLoading, setTopRatedLoading] = useState(false);
  const [nowPlayingLoading, setNowPlayingLoading] = useState(false);
  const [upcomingLoading, setUpcomingLoading] = useState(false);

  const [popularHasMore, setPopularHasMore] = useState(true);
  const [topRatedHasMore, setTopRatedHasMore] = useState(true);
  const [nowPlayingHasMore, setNowPlayingHasMore] = useState(true);
  const [upcomingHasMore, setUpcomingHasMore] = useState(true);
  const [watchHistory, setWatchHistory] = useState<any[]>([]);

  const [dragState, setDragState] = useState({
    isDragging: false,
    startX: 0,
    scrollLeft: 0,
    hasMoved:false
  });

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    setDragState({
      isDragging: true,
      startX: e.pageX - container.offsetLeft,
      scrollLeft: container.scrollLeft,
      hasMoved:false
    });
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!dragState.isDragging) return;
    e.preventDefault();
    const container = e.currentTarget;
    const x = e.pageX - container.offsetLeft;
    const walk = (x - dragState.startX) * 1;
    container.scrollLeft = dragState.scrollLeft - walk;
    if(Math.abs(walk) > 5 && !dragState.hasMoved){
      setDragState({ ...dragState, hasMoved: true });
    }
  };

  const handleMouseUp = () => {
    setDragState({ ...dragState, isDragging: false});
  };

  useEffect(() => {
    async function loadWatchHistory() {
      try {
        const response = await fetch("/api/movies/watched");

        if (!response.ok) {
          throw new Error("Failed to fetch watch history");
        }

        const data = await response.json();

        setWatchHistory(data.results);
      } catch (error) {
        console.error(error);
      }
    }

    if (isLoggedIn) {
      loadWatchHistory();
    }
  }, [isLoggedIn]);

  const fetchMoreMovies = async (category: CategoryKey) => {
    const stateMap = {
      popular: { loading: popularLoading, page: popularPage, setLoading: setPopularLoading, setPage: setPopularPage, setMovies: setPopular, hasMore: popularHasMore, setHasMore: setPopularHasMore, movies: popular },
      top_rated: { loading: topRatedLoading, page: topRatedPage, setLoading: setTopRatedLoading, setPage: setTopRatedPage, setMovies: setTopRated, hasMore: topRatedHasMore, setHasMore: setTopRatedHasMore, movies: topRated },
      now_playing: { loading: nowPlayingLoading, page: nowPlayingPage, setLoading: setNowPlayingLoading, setPage: setNowPlayingPage, setMovies: setNowPlaying, hasMore: nowPlayingHasMore, setHasMore: setNowPlayingHasMore, movies: nowPlaying },
      upcoming: { loading: upcomingLoading, page: upcomingPage, setLoading: setUpcomingLoading, setPage: setUpcomingPage, setMovies: setUpcoming, hasMore: upcomingHasMore, setHasMore: setUpcomingHasMore, movies: upcoming },
    };

    const entry = stateMap[category];
    if (!entry || entry.loading || !entry.hasMore) return;

    entry.setLoading(true);
    const nextPage = entry.page + 1;

    try {
      const response = await fetch(`/api/movies/route?category=${category}&page=${nextPage}`);
      if (!response.ok) throw new Error("Failed to load more movies.");

      const data = await response.json();
      const results = Array.isArray(data.results) ? data.results : [];
      if (results.length === 0) {
        entry.setHasMore(false);
        return;
      }

      entry.setMovies([...entry.movies, ...results]);
      entry.setPage(nextPage);
    } catch (error) {
      console.error(error);
    } finally {
      entry.setLoading(false);
    }
  };

  const handleScroll = (category: CategoryKey) => async (e: UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollWidth - target.scrollLeft - target.clientWidth < 320) {
      await fetchMoreMovies(category);
    }
  };

  const handleClick = (movie: any) => (e: MouseEvent<HTMLDivElement>) => {
    if(dragState.hasMoved){
      return;
    }
    // Navigate to movie details page
    router.push(`/movies/${movie.id}`);
  };

  const renderRow = (title: string, movies: any[], category: CategoryKey | null, loading: boolean) => (
    <section id={category || "watch_history"} className="py-8 px-4">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div
        className="flex space-x-4 overflow-x-scroll pb-4 cursor-grab active:cursor-grabbing"
        onScroll={category ? handleScroll(category) : undefined}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {movies?.map((movie: any, i: number) => (
          <div id={`${category || "watch"}`} key={`${category || "watch"}-${movie.id ?? i}-${i}`}  className="relative flex-shrink-0 w-48 h-72 bg-gray-800 rounded-lg overflow-hidden hover:scale-110 transition-transform duration-300" onClick={handleClick(movie)}>
            <Image
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={`Movie ${movie.title}`}
              width={200}
              height={300}
              draggable={false}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        {loading && (
          <div className="flex items-center justify-center flex-shrink-0 w-48 h-72 bg-gray-900 text-gray-300 rounded-lg">
            Loading...
          </div>
        )}
      </div>
    </section>
);

  return (
    <div>
      {isLoggedIn && renderRow("Watch History", watchHistory, null, false)}
      {renderRow("Popular Movies", popular, "popular", popularLoading)}
      {renderRow("Top Rated Movies", topRated, "top_rated", topRatedLoading)}
      {renderRow("Now Playing Movies", nowPlaying, "now_playing", nowPlayingLoading)}
      {renderRow("Upcoming Movies", upcoming, "upcoming", upcomingLoading)}
    </div>
  );
}
