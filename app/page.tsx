import Image from "next/image";

export default function Home() {
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
            className="dark:invert"
            style={{height:"auto"}}
          />
        </div>
        <nav className="flex space-x-6">
          <a href="#" className="hover:text-gray-300">Home</a>
          <a href="#" className="hover:text-gray-300">TV Shows</a>
          <a href="#" className="hover:text-gray-300">Movies</a>
          <a href="#" className="hover:text-gray-300">My List</a>
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
      <section className="py-8 px-4">
        <h2 className="text-2xl font-bold mb-4">Trending Now</h2>
        <div className="flex space-x-4 overflow-x-scroll pb-4">
          {Array.from({length: 10}, (_, i) => (
          <div key={i} className="relative flex-shrink-0 w-48 h-72 bg-gray-800 rounded-lg overflow-hidden">
            <Image
              src={`https://picsum.photos/200/300?random=${i}`}
              alt={`Movie ${i+1}`}
              fill
              sizes="(max-width: 768px) 50vw, 192px"
              className="object-cover"
            />
          </div>
          ))}
        </div>
      </section>

      <section className="py-8 px-4">
        <h2 className="text-2xl font-bold mb-4">Top Rated</h2>
        <div className="flex space-x-4 overflow-x-scroll pb-4">
          {Array.from({length: 10}, (_, i) => (
            <div key={i} className="flex-shrink-0 w-48 h-72 bg-gray-800 rounded-lg overflow-hidden">
              <Image
                src={`https://picsum.photos/200/300?random=${i+10}`}
                alt={`Movie ${i+11}`}
                width={200}
                height={300}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="py-8 px-4">
        <h2 className="text-2xl font-bold mb-4">Action Movies</h2>
        <div className="flex space-x-4 overflow-x-scroll pb-4">
          {Array.from({length: 10}, (_, i) => (
            <div key={i} className="flex-shrink-0 w-48 h-72 bg-gray-800 rounded-lg overflow-hidden">
              <Image
                src={`https://picsum.photos/200/300?random=${i+20}`}
                alt={`Movie ${i+21}`}
                width={200}
                height={300}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
