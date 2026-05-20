"use client";

import Header from "./header";
import HomeRows from "./movieRows";

type HomeProps = {
  popularMovies: any[];
  topRatedMovies: any[];
  nowPlayingMovies: any[];
  upcomingMovies: any[];
  activeSession?: string | false;
};

export default function Home({
  popularMovies: initialPopular,
  topRatedMovies: initialTopRated,
  nowPlayingMovies: initialNowPlaying,
  upcomingMovies: initialUpcoming,
  activeSession,
}: HomeProps) {
  const isLoggedIn = !!activeSession;

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Header activeSession={activeSession} />

      {/* Hero */}
      <section className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1489599735734-79b4b9c8e8b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/30 via-transparent to-background/30" />

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-5xl font-bold tracking-tighter text-white md:text-7xl">
            WatchBuddy
          </h1>
          <p className="mt-6 text-lg text-neutral-300 md:text-xl">
            Discover your next favorite movie or show
          </p>
        </div>
        {/* <div className="scroll-down"></div> */}


      </section>

      <HomeRows
        popularMovies={initialPopular}
        topRatedMovies={initialTopRated}
        nowPlayingMovies={initialNowPlaying}
        upcomingMovies={initialUpcoming}
        isLoggedIn={isLoggedIn}
      />
    </div>
  );
}
