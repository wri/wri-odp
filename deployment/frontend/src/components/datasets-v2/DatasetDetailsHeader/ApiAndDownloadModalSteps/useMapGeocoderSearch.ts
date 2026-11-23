import { type ListItemProps } from '@worldresources/wri-design-systems';
import { useMemo } from 'react';
import { useQuery } from 'react-query';

export type GeocoderSearchResult = {
    id: string;
    label: string;
    bbox: [number, number, number, number] | null;
    center: [number, number];
};

/**
 * Minimum query length before hitting the geocoder; single letters return noisy
 * matches and would fire a request on nearly every keystroke.
 */
export const MAP_SEARCH_MIN_QUERY_LENGTH = 2;

/**
 * Lowercases and strips diacritics so `"bogota"` matches `"Bogotá"` and
 * `"sao paulo"` matches `"São Paulo"` — the geocoder resolves them by fuzzy
 * matching, but any literal comparison on our side needs the same normal form.
 */
export function normalizeSearchText(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

type UseMapGeocoderSearchParams = {
    query: string;
    accessToken: string;
    enabled: boolean;
};

export function useMapGeocoderSearch({ query, accessToken, enabled }: UseMapGeocoderSearchParams) {
    const normalizedQuery = query.trim();
    const isQueryLongEnough = normalizedQuery.length >= MAP_SEARCH_MIN_QUERY_LENGTH;

    const { data: mapSearchResults = [], isLoading: isLoadingMapSearch } = useQuery<
        GeocoderSearchResult[],
        unknown
    >(
        // The query is normalized (lowercased, trimmed) so typing case changes
        // reuses the cached results instead of refetching.
        ['map-search', normalizeSearchText(normalizedQuery)],
        async (): Promise<GeocoderSearchResult[]> => {
            if (normalizedQuery.length < MAP_SEARCH_MIN_QUERY_LENGTH) {
                return [];
            }

            const response = await fetch(
                // `language` keeps `place_name` in one language so suggestions do
                // not mix translations of the same place.
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(normalizedQuery)}.json?access_token=${accessToken}&limit=8&language=en&types=country,region,place,locality`
            );
            const json = (await response.json()) as {
                features?: Array<{
                    id?: string;
                    place_name?: string;
                    bbox?: [number, number, number, number];
                    center?: [number, number];
                }>;
            };

            return (json.features ?? [])
                .filter(
                    (
                        feature
                    ): feature is Required<
                        Pick<NonNullable<typeof json.features>[number], 'place_name' | 'center'>
                    > & {
                        id?: string;
                        bbox?: [number, number, number, number];
                    } => Boolean(feature.place_name && feature.center)
                )
                .map((feature, index) => {
                    const rawId = feature.id?.trim();
                    const fallbackId = `${feature.place_name}-${feature.center[0]}-${feature.center[1]}`;

                    return {
                        id: `${rawId && rawId.length > 0 ? rawId : fallbackId}-${index}`,
                        label: feature.place_name,
                        bbox: feature.bbox ?? null,
                        center: feature.center,
                    };
                });
        },
        {
            enabled: enabled && isQueryLongEnough,
            keepPreviousData: true,
        }
    );

    const mapSearchOptions = useMemo<ListItemProps[]>(
        () =>
            mapSearchResults.map((result) => ({
                id: result.id,
                label: result.label,
                // Filtering hint only: the dropdown renders `mapSearchResults`
                // directly, so a literal mismatch can never hide a suggestion.
                searchLabel: result.label,
                variant: 'select',
            })),
        [mapSearchResults]
    );

    return {
        mapSearchResults,
        mapSearchOptions,
        isLoadingMapSearch,
        isQueryLongEnough,
    };
}
