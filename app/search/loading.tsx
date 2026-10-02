export default function SearchLoading() {
  return <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-12" aria-busy="true">
    <span role="status" className="sr-only">Searching movies</span>
    <div className="mb-8 h-10 w-3/4 max-w-xl animate-pulse rounded-lg bg-neutral-900" />
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: 10 }, (_, index) => <div key={index} className="aspect-[2/3] animate-pulse rounded-xl bg-neutral-900" />)}
    </div>
  </div>;
}
