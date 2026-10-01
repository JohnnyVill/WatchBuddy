export default function Loading() {
  return <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6" aria-busy="true">
    <span role="status" className="sr-only">Loading movies</span>
    <div className="mb-6 h-12 w-3/4 max-w-xl animate-pulse rounded-lg bg-neutral-900" />
    <div className="mb-12 h-5 w-1/2 max-w-sm animate-pulse rounded bg-neutral-900" />
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: 6 }, (_, index) => <div key={index} className="aspect-[2/3] w-[152px] shrink-0 animate-pulse rounded-xl bg-neutral-900 md:w-[192px]" />)}
    </div>
  </div>;
}
