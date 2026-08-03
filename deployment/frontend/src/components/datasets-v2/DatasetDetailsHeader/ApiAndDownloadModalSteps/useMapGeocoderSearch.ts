import { type ListItemProps } from '@worldresources/wri-design-systems';
import { useMemo } from 'react';
import { useQuery } from 'react-query';

export type GeocoderSearchResult = {
    id: string;
    label: string;
    bbox: [number, number, number, number] | null;
    center: [number, number];
};

type UseMapGeocoderSearchParams = {
    query: string;
    accessToken: string;
    enabled: boolean;
};

export function useMapGeocoderSearch({ query, accessToken, enabled }: UseMapGeocoderSearchParams) {
    const { data: mapSearchResults = [], isLoading: isLoadingMapSearch } = useQuery<
        GeocoderSearchResult[],
        unknown
    >(
        ['map-search', query],
        async (): Promise<GeocoderSearchResult[]> => {
            const normalizedQuery = query.trim();
            if (normalizedQuery.length < 2) {
                return [];
            }

            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(normalizedQuery)}.json?access_token=${accessToken}&limit=8&types=country,region,place,locality`
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
            enabled,
            keepPreviousData: true,
        }
    );

    const mapSearchOptions = useMemo<ListItemProps[]>(
        () =>
            mapSearchResults.map((result) => ({
                id: result.id,
                label: result.label,
                searchLabel: result.label,
                variant: 'select',
            })),
        [mapSearchResults]
    );

    return {
        mapSearchResults,
        mapSearchOptions,
        isLoadingMapSearch,
    };
}
