export default function LoadingMovie() {
  return <div aria-busy="true">
    <span role="status" className="sr-only">Loading movie details</span>
    <div className="h-[25dvh] animate-pulse bg-neutral-900 sm:h-[35dvh]" />
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 md:flex-row">
      <div className="aspect-[2/3] w-40 shrink-0 animate-pulse rounded-xl bg-neutral-900 md:w-52" />
      <div className="w-full space-y-6"><div className="h-10 w-3/4 animate-pulse rounded bg-neutral-900" /><div className="h-24 animate-pulse rounded bg-neutral-900" /><div className="h-12 w-56 animate-pulse rounded bg-neutral-900" /></div>
    </div>
  </div>;
}
