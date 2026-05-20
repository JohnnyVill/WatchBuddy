import Image from "next/image";
import {
  useState,
  useCallback,
  useEffect,
  type MouseEvent,
  type UIEvent,
} from "react";
import { useRouter } from "next/navigation";

type HomeProps = {
  popularMovies: any[];
  topRatedMovies: any[];
  nowPlayingMovies: any[];
  upcomingMovies: any[];
  isLoggedIn: boolean;
};

type CategoryKey = "popular" | "top_rated" | "now_playing" | "upcoming";

const SKELETON_COUNT = 4;

function SkeletonCard() {
  return (
    <div className="w-40 flex-shrink-0 animate-pulse md:w-48">
      <div className="aspect-[2/3] rounded-xl bg-neutral-800" />
    </div>
  );
}

export default function HomeRows({
  popularMovies: initialPopular,
  topRatedMovies: initialTopRated,
  nowPlayingMovies: initialNowPlaying,
  upcomingMovies: initialUpcoming,
  isLoggedIn,
}: HomeProps) {
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

  const [popularHasMore, setPopularHasMore] = useState(
    (initialPopular ?? []).length >= 20,
  );
  const [topRatedHasMore, setTopRatedHasMore] = useState(
    (initialTopRated ?? []).length >= 20,
  );
  const [nowPlayingHasMore, setNowPlayingHasMore] = useState(
    (initialNowPlaying ?? []).length >= 20,
  );
  const [upcomingHasMore, setUpcomingHasMore] = useState(
    (initialUpcoming ?? []).length >= 20,
  );

  const [watchHistory, setWatchHistory] = useState<any[]>([]);
  const [watchHistoryLoading, setWatchHistoryLoading] = useState(false);
  const [watchHistoryError, setWatchHistoryError] = useState(false);

  const [dragState, setDragState] = useState({
    isDragging: false,
    startX: 0,
    scrollLeft: 0,
    hasMoved: false,
  });

  const handleMouseDown = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    setDragState({
      isDragging: true,
      startX: e.pageX - container.offsetLeft,
      scrollLeft: container.scrollLeft,
      hasMoved: false,
    });
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!dragState.isDragging) return;
      e.preventDefault();
      const container = e.currentTarget;
      const x = e.pageX - container.offsetLeft;
      const walk = (x - dragState.startX) * 1;
      container.scrollLeft = dragState.scrollLeft - walk;
      if (Math.abs(walk) > 5 && !dragState.hasMoved) {
        setDragState((prev) => ({ ...prev, hasMoved: true }));
      }
    },
    [dragState.isDragging, dragState.startX, dragState.scrollLeft, dragState.hasMoved],
  );

  const handleMouseUp = useCallback(() => {
    setDragState((prev) => ({ ...prev, isDragging: false }));
  }, []);

  // Load watch history
  useEffect(() => {
    if (!isLoggedIn) return;
    let cancelled = false;

    async function loadWatchHistory() {
      setWatchHistoryLoading(true);
      try {
        const response = await fetch("/api/movies/watched");
        if (!response.ok) throw new Error("Failed to fetch watch history");
        const data = await response.json();
        if (!cancelled) {
          setWatchHistory(data.results ?? []);
          setWatchHistoryError(false);
        }
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Failed to load watch history:",
            error instanceof Error ? error.message : "Unknown error",
          );
          setWatchHistoryError(true);
        }
      } finally {
        if (!cancelled) setWatchHistoryLoading(false);
      }
    }

    loadWatchHistory();
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  const fetchMoreMovies = async (category: CategoryKey) => {
    const stateMap: Record<
      CategoryKey,
      {
        loading: boolean;
        page: number;
        setLoading: (v: boolean) => void;
        setPage: (v: number) => void;
        setMovies: (v: any[]) => void;
        hasMore: boolean;
        setHasMore: (v: boolean) => void;
        movies: any[];
      }
    > = {
      popular: {
        loading: popularLoading,
        page: popularPage,
        setLoading: setPopularLoading,
        setPage: setPopularPage,
        setMovies: setPopular,
        hasMore: popularHasMore,
        setHasMore: setPopularHasMore,
        movies: popular,
      },
      top_rated: {
        loading: topRatedLoading,
        page: topRatedPage,
        setLoading: setTopRatedLoading,
        setPage: setTopRatedPage,
        setMovies: setTopRated,
        hasMore: topRatedHasMore,
        setHasMore: setTopRatedHasMore,
        movies: topRated,
      },
      now_playing: {
        loading: nowPlayingLoading,
        page: nowPlayingPage,
        setLoading: setNowPlayingLoading,
        setPage: setNowPlayingPage,
        setMovies: setNowPlaying,
        hasMore: nowPlayingHasMore,
        setHasMore: setNowPlayingHasMore,
        movies: nowPlaying,
      },
      upcoming: {
        loading: upcomingLoading,
        page: upcomingPage,
        setLoading: setUpcomingLoading,
        setPage: setUpcomingPage,
        setMovies: setUpcoming,
        hasMore: upcomingHasMore,
        setHasMore: setUpcomingHasMore,
        movies: upcoming,
      },
    };

    const entry = stateMap[category];
    if (!entry || entry.loading || !entry.hasMore) return;

    entry.setLoading(true);
    const nextPage = entry.page + 1;

    try {
      const response = await fetch(
        `/api/movies?category=${category}&page=${nextPage}`,
      );
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

  const handleScroll =
    (category: CategoryKey) => async (e: UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      if (
        target.scrollWidth - target.scrollLeft - target.clientWidth <
        320
      ) {
        await fetchMoreMovies(category);
      }
    };

  const handleClick = useCallback(
    (movie: any) => (_e: MouseEvent<HTMLDivElement>) => {
      if (dragState.hasMoved) return;
      router.push(`/movies/${movie.id}`);
    },
    [dragState.hasMoved, router],
  );

  const renderRow = (
    title: string,
    movies: any[],
    category: CategoryKey | null,
    loading: boolean,
    error?: boolean,
  ) => (
    <section className="space-y-4 px-6 py-8 md:py-12">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
          {title}
        </h2>
      </div>

      {error ? (
        <p className="mx-auto max-w-7xl text-sm text-red-400">
          Failed to load. Try refreshing the page.
        </p>
      ) : movies.length === 0 && !loading ? (
        <p className="mx-auto max-w-7xl text-sm text-muted-foreground">
          Nothing here yet.
        </p>
      ) : (
        <div
          className="scrollbar-hide mx-auto flex max-w-7xl gap-3 overflow-x-auto pb-2 cursor-grab active:cursor-grabbing md:gap-4"
          onScroll={category ? handleScroll(category) : undefined}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {movies?.map((movie: any, i: number) => (
            <div
              key={`${category ?? "watch"}-${movie.id ?? i}-${i}`}
              className="group relative w-40 flex-shrink-0 cursor-pointer transition-transform duration-300 hover:scale-[1.04] active:scale-[0.98] md:w-48"
              onClick={handleClick(movie)}
            >
              <div className="aspect-[2/3] overflow-hidden rounded-xl bg-neutral-800">
                {movie.poster_path ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title ?? "Movie poster"}
                    width={200}
                    height={300}
                    draggable={false}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                    No poster
                  </div>
                )}
              </div>
              {/* Title overlay on hover */}
              <div className="pointer-events-none absolute inset-0 flex items-end rounded-xl bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="text-xs font-medium text-white line-clamp-2">
                  {movie.title}
                </span>
              </div>
            </div>
          ))}

          {loading &&
            Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <SkeletonCard key={`skeleton-${i}`} />
            ))}
        </div>
      )}
    </section>
  );

  const renderLoadingRow = (title: string) => (
    <section className="space-y-4 px-6 py-8 md:py-12">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
          {title}
        </h2>
      </div>
      <div className="mx-auto flex max-w-7xl gap-3 overflow-hidden md:gap-4">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <SkeletonCard key={`skeleton-${i}`} />
        ))}
      </div>
    </section>
  );

  return (
    <div>
      {isLoggedIn &&
        watchHistoryLoading &&
        renderLoadingRow("Watch History")}

      {isLoggedIn &&
        !watchHistoryLoading &&
        watchHistory.length > 0 &&
        renderRow(
          "Watch History",
          watchHistory,
          null,
          false,
          watchHistoryError,
        )}

      {isLoggedIn &&
        !watchHistoryLoading &&
        watchHistory.length === 0 &&
        !watchHistoryError &&
        renderRow("Watch History", [], null, false)}

      {renderRow("Popular Movies", popular, "popular", popularLoading)}
      {renderRow("Top Rated", topRated, "top_rated", topRatedLoading)}
      {renderRow(
        "Now Playing",
        nowPlaying,
        "now_playing",
        nowPlayingLoading,
      )}
      {renderRow("Upcoming", upcoming, "upcoming", upcomingLoading)}
    </div>
  );
}
