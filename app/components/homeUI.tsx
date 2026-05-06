"use client";

import Image from "next/image";
import { useState } from "react";
import HomeRows from "./movieRows";
import LoginModal from "./loginModal";
import SignupModal from "./signUpModal";
import {useRouter} from "next/navigation";
import Logout from "./logout";

type HomeProps = {
  popularMovies: any[];
  topRatedMovies: any[];
  nowPlayingMovies: any[];
  upcomingMovies: any[];
  activeSession?: string | false;
};

export default function Home({ popularMovies: initialPopular, topRatedMovies: initialTopRated, nowPlayingMovies: initialNowPlaying, upcomingMovies: initialUpcoming, activeSession }: HomeProps) {
  const isLoggedIn = !!activeSession;
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const router = useRouter();

  const handleLogin = () => {
    isLoggedIn
    router.refresh(); // Refresh the page to update session state
    setShowLoginModal(false);
  };

  const handleSignup = () => {
    isLoggedIn
    router.refresh(); // Refresh the page to update session state
    setShowSignupModal(false);
  };

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
        {!isLoggedIn ? (
          <nav className="flex space-x-6">
            <button onClick={() => setShowLoginModal(true)} className="hover:text-gray-300">
              Login
            </button>
            <button onClick={() => setShowSignupModal(true)} className="hover:text-gray-300">
              Signup
            </button>
          </nav>
        ): //text that welcomes the user and a logout button
        (
          <nav className="flex space-x-6">
            <span className="text-gray-300">Welcome back, {isLoggedIn && activeSession}!</span>
            <Logout />
          </nav>
        )}
      </header>

   
      <LoginModal
        visible={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
      />
      
      <SignupModal
        visible={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSignup={handleSignup}
      />
    

      <section className="relative h-screen flex items-center justify-center bg-gradient-to-r from-black via-transparent to-black">
        <div
          id="home"
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
            {/* <button className="bg-red-600 hover:bg-red-700 px-8 py-3 rounded font-semibold">Play</button>
            <button className="bg-gray-600 hover:bg-gray-700 px-8 py-3 rounded font-semibold">More Info</button> */}
          </div>
        </div>
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


