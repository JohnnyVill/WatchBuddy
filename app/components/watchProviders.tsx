import Image from "next/image";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import type { ProviderAvailability } from "../lib/types";
export default function WatchProviders({ availability, failed = false }: { availability: ProviderAvailability | null; failed?: boolean }) {
  const groups = [
    { title: "Subscription", providers: availability?.flatrate ?? [] },
    { title: "Rent", providers: availability?.rent ?? [] },
    { title: "Buy", providers: availability?.buy ?? [] },
  ];
  const hasProviders = groups.some((group) => group.providers.length > 0);
  const link = availability?.link && /^https:\/\/(www\.)?themoviedb\.org\//.test(availability.link) ? availability.link : null;
  return <section className="rounded-2xl border border-border bg-neutral-900/40 p-5" aria-labelledby="providers-title">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 id="providers-title" className="text-base font-semibold">Where to watch</h2>
      <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">United States</span>
    </div>
    {failed ? <p className="mt-4 text-sm text-muted-foreground">Availability couldn&apos;t load. Refresh this page to try again.</p> :
      !hasProviders ? <p className="mt-4 text-sm text-muted-foreground">No streaming, rental, or purchase options listed for the United States yet.</p> :
      <div className="mt-5 space-y-5">
        {groups.filter((group) => group.providers.length > 0).map((group) => <div key={group.title}>
          <h3 className="mb-2 text-xs font-medium text-muted-foreground">{group.title}</h3>
          <ul className="flex flex-wrap gap-2">
            {group.providers.map((provider) => <li key={provider.provider_id} className="flex items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-2 text-xs">
              {provider.logo_path && <Image src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`} alt="" width={24} height={24} className="rounded" />}
              <span>{provider.provider_name}</span>
            </li>)}
          </ul>
        </div>)}
      </div>}
    {link && <a href={link} target="_blank" rel="noreferrer" className="button button-secondary mt-5 text-sm">
      Explore watch options <ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span>
    </a>}
    <p className="mt-4 text-xs text-muted-foreground">Availability data by <a href="https://www.justwatch.com" target="_blank" rel="noreferrer" className="underline underline-offset-4">JustWatch</a>.</p>
  </section>;
}
