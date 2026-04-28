import { fetchWhereToWatch } from "@/app/lib/tmdb";

export async function getUsProviderData(movieId: string) {
    const providers = await fetchWhereToWatch(movieId);
    const hasProviders = providers? true : false;
    console.log("Watch providers:", providers, "Has watch providers?", hasProviders);
    return {
        flatrate: providers? providers.flatrate : null,
        rent: providers? providers.rent : null,
        buy: providers? providers.buy : null
    };
}
