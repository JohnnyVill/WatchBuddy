import { getUsProviderData } from "@/app/lib/providerUtils";

type Provider = {
    provider_id: number;
    provider_name?: string;
    logo_path?: string;
};

export default async function WatchProviders({ params }: { params: { id: string } }) {
    const movieDetails = params;
    const { flatrate, rent, buy }: { flatrate?: Provider[]; rent?: Provider[]; buy?: Provider[] } = await getUsProviderData(movieDetails.id);
    // console.log("Flatrate providers:", flatrate, "Rent providers:", rent, "Buy providers:", buy);

    // Collect all unique providers
    const allProviders = new Set([...(flatrate || []), ...(rent || []), ...(buy || [])].map((p: Provider) => p.provider_id));
    const providerList = Array.from(allProviders)
        .map(id => (flatrate || []).find((p: Provider) => p.provider_id === id) || (rent || []).find((p: Provider) => p.provider_id === id) || (buy || []).find((p: Provider) => p.provider_id === id))
        .filter((p): p is Provider => p !== undefined);

    return (
        <div>
            {providerList.length > 0 ? (
                <>
                    <h2>Available at:</h2>
                    <table className="table-auto border-collapse border border-gray-300">
                        <thead>
                            <tr>
                                <th className="border border-gray-300 px-4 py-2"></th>
                                {providerList.map(provider => (
                                    <th key={provider.provider_id} className="border border-gray-300 px-4 py-2">
                                        {provider.logo_path && <img src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`} alt={provider.provider_name} className="w-8 h-8 mx-auto" />}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-gray-300 px-4 py-2 font-semibold">Streaming</td>
                                {providerList.map(provider => (
                                    <td key={provider.provider_id} className="border border-gray-300 px-4 py-2 text-center">
                                        {(flatrate || []).some(p => p.provider_id === provider.provider_id) ? '✓' : ''}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="border border-gray-300 px-4 py-2 font-semibold">Rent</td>
                                {providerList.map(provider => (
                                    <td key={provider.provider_id} className="border border-gray-300 px-4 py-2 text-center">
                                        {(rent || []).some(p => p.provider_id === provider.provider_id) ? '✓' : ''}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="border border-gray-300 px-4 py-2 font-semibold">Buy</td>
                                {providerList.map(provider => (
                                    <td key={provider.provider_id} className="border border-gray-300 px-4 py-2 text-center">
                                        {(buy || []).some(p => p.provider_id === provider.provider_id) ? '✓' : ''}
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </>
            ) : null}
        </div>
    );
}