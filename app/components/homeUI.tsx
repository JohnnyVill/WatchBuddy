"use client";

import Image from "next/image";
import { useRef, useState } from "react";
type HomeProps = {
  popularMovies: any[];
  topRatedMovies: any[];
  nowPlayingMovies: any[];
};
export default function Home({ popularMovies, topRatedMovies, nowPlayingMovies }: HomeProps) {
  const [dragState, setDragState] = useState({
    isDragging: false,
    startX: 0,
    scrollLeft: 0,
  });

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    setDragState({
      isDragging: true,
      startX: e.pageX - container.offsetLeft,
      scrollLeft: container.scrollLeft,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-black bg-opacity-75 fixed top-0 w-full z-10">
        <div className="flex items-center">
          <Image
            src="/next.svg"
            alt="WatchBuddy Logo"
            width={120}
            height={40}
            draggable={false}
            className="dark:invert"
            style={{height:"auto"}}
          />
        </div>
        <nav className="flex space-x-6">
          <a href="#" className="hover:text-gray-300">Home</a>
          <a href="#continue-watching" className="hover:text-gray-300">Continue Watching</a>
          <a href="#trending" className="hover:text-gray-300">Trending Now</a>
          <a href="#popular-with-friends" className="hover:text-gray-300">Popular with Friends</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-r from-black via-transparent to-black">
        <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1489599735734-79b4b9c8e8b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')"}}></div>
        <div className="relative z-10 text-center max-w-2xl px-4">
          <h1 className="text-5xl font-bold mb-4">WatchBuddy</h1>
          <p className="text-xl mb-8">Discover your next favorite movie or TV show</p>
          <div className="flex space-x-4 justify-center">
            <button className="bg-red-600 hover:bg-red-700 px-8 py-3 rounded font-semibold">Play</button>
            <button className="bg-gray-600 hover:bg-gray-700 px-8 py-3 rounded font-semibold">More Info</button>
          </div>
        </div>
      </section>

      {/* Content Rows */}
      <section id="continue-watching" className="py-8 px-4">
        <h2 className="text-2xl font-bold mb-4">Continue watching</h2>
        <div 
          className="flex space-x-4 overflow-x-scroll pb-4 cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {popularMovies?.slice(0, 10).map((movie: any, i: number) => (
          <div key={i} className="relative flex-shrink-0 w-48 h-72 bg-gray-800 rounded-lg overflow-hidden hover:scale-110 transition-transform duration-300">
            <Image
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={`Movie ${movie.title}`}
              width={200}
              height={300}
              draggable={false}
              className="w-full h-full object-cover "
            />
          </div>
          ))}
        </div>
      </section>

      <section id="trending" className="py-8 px-4">
        <h2 className="text-2xl font-bold mb-4">Trending Now</h2>
        <div 
          className="flex space-x-4 overflow-x-scroll pb-4 cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {topRatedMovies?.slice(0, 10).map((movie: any, i: number) => (
            <div key={i} className="flex-shrink-0 w-48 h-72 bg-gray-800 rounded-lg overflow-hidden hover:scale-110 transition-transform duration-300">
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
        </div>
      </section>

      <section id="popular-with-friends" className="py-8 px-4">
        <h2 className="text-2xl font-bold mb-4">Popular with Friends</h2>
        <div 
          className="flex space-x-4 overflow-x-scroll pb-4 cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {nowPlayingMovies?.slice(0, 10).map((movie: any, i: number) => (
            <div key={i} className="flex-shrink-0 w-48 h-72 bg-gray-800 rounded-lg overflow-hidden hover:scale-110 transition-transform duration-300 ">
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
        </div>
      </section>
    </div>
  );
}


