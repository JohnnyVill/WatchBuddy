"use client";

import Image from "next/image";
import { useState, type MouseEvent, type UIEvent } from "react";
type HomeProps = {
  popularMovies: any[];
  topRatedMovies: any[];
  nowPlayingMovies: any[];
};

type CategoryKey = "popular" | "top_rated" | "now_playing";

export default function Home({ popularMovies: initialPopular, topRatedMovies: initialTopRated, nowPlayingMovies: initialNowPlaying }: HomeProps) {
  const [popular, setPopular] = useState(initialPopular ?? []);
  const [topRated, setTopRated] = useState(initialTopRated ?? []);
  const [nowPlaying, setNowPlaying] = useState(initialNowPlaying ?? []);

  const [popularPage, setPopularPage] = useState(1);
  const [topRatedPage, setTopRatedPage] = useState(1);
  const [nowPlayingPage, setNowPlayingPage] = useState(1);

  const [popularLoading, setPopularLoading] = useState(false);
  const [topRatedLoading, setTopRatedLoading] = useState(false);
  const [nowPlayingLoading, setNowPlayingLoading] = useState(false);

  const [popularHasMore, setPopularHasMore] = useState(true);
  const [topRatedHasMore, setTopRatedHasMore] = useState(true);
  const [nowPlayingHasMore, setNowPlayingHasMore] = useState(true);

  const [dragState, setDragState] = useState({
    isDragging: false,
    startX: 0,
    scrollLeft: 0,
  });

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    setDragState({
      isDragging: true,
      startX: e.pageX - container.offsetLeft,
      scrollLeft: container.scrollLeft,
    });
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!dragState.isDragging) return;

    e.preventDefault();
    const container = e.currentTarget;
    const x = e.pageX - container.offsetLeft;
    const walk = (x - dragState.startX) * 1;
    container.scrollLeft = dragState.scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setDragState({ ...dragState, isDragging: false });
  };

  const fetchMoreMovies = async (category: CategoryKey) => {
    const stateMap = {
      popular: { loading: popularLoading, page: popularPage, setLoading: setPopularLoading, setPage: setPopularPage, setMovies: setPopular, hasMore: popularHasMore, setHasMore: setPopularHasMore, movies: popular },
      top_rated: { loading: topRatedLoading, page: topRatedPage, setLoading: setTopRatedLoading, setPage: setTopRatedPage, setMovies: setTopRated, hasMore: topRatedHasMore, setHasMore: setTopRatedHasMore, movies: topRated },
      now_playing: { loading: nowPlayingLoading, page: nowPlayingPage, setLoading: setNowPlayingLoading, setPage: setNowPlayingPage, setMovies: setNowPlaying, hasMore: nowPlayingHasMore, setHasMore: setNowPlayingHasMore, movies: nowPlaying },
    };

    const entry = stateMap[category];
    if (!entry || entry.loading || !entry.hasMore) return;

    entry.setLoading(true);
    const nextPage = entry.page + 1;

    try {
      const response = await fetch(`/api/movies?category=${category}&page=${nextPage}`);
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

  const renderRow = (title: string, movies: any[], category: CategoryKey, loading: boolean) => (
    <section id={category} className="py-8 px-4">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div
        className="flex space-x-4 overflow-x-scroll pb-4 cursor-grab active:cursor-grabbing"
        onScroll={handleScroll(category)}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {movies?.map((movie: any, i: number) => (
          <div key={`${category}-${movie.id ?? i}-${i}`} className="relative flex-shrink-0 w-48 h-72 bg-gray-800 rounded-lg overflow-hidden hover:scale-110 transition-transform duration-300">
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
    <div className="min-h-screen bg-black text-white">
      <header className="flex items-center justify-between p-4 bg-black bg-opacity-75 fixed top-0 w-full z-10">
        <div className="flex items-center">
          <Image
            src="/next.svg"
            alt="WatchBuddy Logo"
            width={120}
            height={40}
            draggable={false}
            className="dark:invert"
            style={{ height: "auto" }}
          />
        </div>
        <nav className="flex space-x-6">
          <a href="#" className="hover:text-gray-300">
            Home
          </a>
          <a href="#popular" className="hover:text-gray-300">
            Continue Watching
          </a>
          <a href="#top_rated" className="hover:text-gray-300">
            Trending Now
          </a>
          <a href="#now_playing" className="hover:text-gray-300">
            Popular with Friends
          </a>
        </nav>
      </header>

      <section className="relative h-screen flex items-center justify-center bg-gradient-to-r from-black via-transparent to-black">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1489599735734-79b4b9c8e8b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
          }}
        ></div>
        <div className="relative z-10 text-center max-w-2xl px-4">
          <h1 className="text-5xl font-bold mb-4">WatchBuddy</h1>
          <p className="text-xl mb-8">Discover your next favorite movie or TV show</p>
          <div className="flex space-x-4 justify-center">
            <button className="bg-red-600 hover:bg-red-700 px-8 py-3 rounded font-semibold">Play</button>
            <button className="bg-gray-600 hover:bg-gray-700 px-8 py-3 rounded font-semibold">More Info</button>
          </div>
        </div>
      </section>

      {renderRow("Continue watching", popular, "popular", popularLoading)}
      {renderRow("Trending Now", topRated, "top_rated", topRatedLoading)}
      {renderRow("Popular with Friends", nowPlaying, "now_playing", nowPlayingLoading)}
    </div>
  );
}


