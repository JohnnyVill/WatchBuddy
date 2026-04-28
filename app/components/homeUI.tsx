"use client";

import Image from "next/image";
import HomeRows from "./movieRows";

type HomeProps = {
  popularMovies: any[];
  topRatedMovies: any[];
  nowPlayingMovies: any[];
};

export default function Home({ popularMovies: initialPopular, topRatedMovies: initialTopRated, nowPlayingMovies: initialNowPlaying }: HomeProps) {


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

          <HomeRows
            popularMovies={initialPopular}
            topRatedMovies={initialTopRated}
            nowPlayingMovies={initialNowPlaying}
          />

          
    </div>
  );
}


