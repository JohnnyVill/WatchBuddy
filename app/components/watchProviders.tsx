import { getUsProviderData } from "@/app/lib/providerUtils";
import { Check } from "@phosphor-icons/react/dist/ssr";

type Provider = {
  provider_id: number;
  provider_name?: string;
  logo_path?: string;
};

export default async function WatchProviders({
  params,
}: {
  params: { id: string };
}) {
  const movieDetails = params;
  const {
    flatrate,
    rent,
    buy,
  }: {
    flatrate?: Provider[];
    rent?: Provider[];
    buy?: Provider[];
  } = await getUsProviderData(movieDetails.id);

  const allProviders = new Set(
    [...(flatrate || []), ...(rent || []), ...(buy || [])].map(
      (p: Provider) => p.provider_id,
    ),
  );
  const providerList = Array.from(allProviders)
    .map(
      (id) =>
        (flatrate || []).find((p: Provider) => p.provider_id === id) ||
        (rent || []).find((p: Provider) => p.provider_id === id) ||
        (buy || []).find((p: Provider) => p.provider_id === id),
    )
    .filter((p): p is Provider => p !== undefined);

  if (providerList.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">Available at</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[320px] border-separate border-spacing-0 rounded-xl border border-border text-sm">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground" />
              {providerList.map((provider) => (
                <th
                  key={provider.provider_id}
                  className="px-3 py-2 text-center"
                >
                  {provider.logo_path && (
                    <img
                      src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                      alt={provider.provider_name}
                      className="mx-auto h-8 w-8 rounded object-contain"
                    />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(["Streaming", "Rent", "Buy"] as const).map((label) => {
              const source =
                label === "Streaming"
                  ? flatrate
                  : label === "Rent"
                    ? rent
                    : buy;
              return (
                <tr key={label} className="border-t border-border">
                  <td className="px-3 py-2.5 text-muted-foreground">
                    {label}
                  </td>
                  {providerList.map((provider) => (
                    <td
                      key={provider.provider_id}
                      className="px-3 py-2.5 text-center"
                    >
                      {(source || []).some(
                        (p) => p.provider_id === provider.provider_id,
                      ) ? (
                        <Check
                          weight="bold"
                          className="mx-auto h-4 w-4 text-accent"
                        />
                      ) : null}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
