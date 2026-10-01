import Link from "next/link";
export default function NotFound() {
  return <div className="mx-auto max-w-lg px-6 py-24 text-center">
    <p className="eyebrow mb-3">A missing scene</p>
    <h1 className="text-3xl font-semibold tracking-tight">Movie not found</h1>
    <p className="mt-4 text-muted-foreground">This movie may no longer be available. Let&apos;s find you something else to watch.</p>
    <Link href="/#browse" className="button button-primary mt-7">Back to browse</Link>
  </div>;
}
