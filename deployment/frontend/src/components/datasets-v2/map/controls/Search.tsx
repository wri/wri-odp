import React, { useState, useRef, useCallback, type MutableRefObject, useEffect } from 'react';
import { fitBounds } from '@math.gl/web-mercator';
import { useMapState, useBounds } from '@/utils/storeHooks';
import isEmpty from 'lodash/isEmpty';
import { Search as WriSearch, type ListItemProps } from '@worldresources/wri-design-systems';

type GeoFeature = {
    id: string;
    place_name: string;
    bbox?: number[];
    center?: number[];
};

export default function Search({
    mapContainerRef,
}: {
    mapContainerRef: MutableRefObject<HTMLDivElement | null>;
}) {
    const [options, setOptions] = useState<ListItemProps[]>([]);
    const [features, setFeatures] = useState<GeoFeature[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { setViewState, viewState } = useMapState();
    const { bounds, setBounds } = useBounds();
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const viewStateRef = useRef(viewState);
    viewStateRef.current = viewState;

    useEffect(() => {
        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, []);
    const fetchSuggestions = useCallback(async (query: string) => {
        if (!query) {
            setOptions([]);
            setFeatures([]);
            return;
        }
        setIsLoading(true);
        try {
            const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';
            const res = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&types=country,region,place,locality`
            );
            const data = (await res.json()) as { features: GeoFeature[] };
            const featureList: GeoFeature[] = data.features ?? [];
            setFeatures(featureList);
            setOptions(featureList.map((f) => ({ id: f.id, label: f.place_name, items: [] })));
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleQueryChange = useCallback(
        (query: string) => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
            debounceTimer.current = setTimeout(() => {
                void fetchSuggestions(query);
            }, 300);
        },
        [fetchSuggestions]
    );

    const handleSelect = useCallback(
        (selected: ListItemProps) => {
            const feature = features.find((f) => f.id === selected.id);
            if (!feature) return;
            if (feature.bbox) {
                setBounds({ bbox: feature.bbox, options: { zoom: 2 } });
            } else if (feature.center) {
                const [lng, lat] = feature.center as [number, number];
                setBounds({
                    bbox: [lng, lat, lng, lat],
                    options: { zoom: 10 },
                });
            }
        },
        [features, setBounds]
    );

    const handleFitBounds = useCallback(() => {
        const bbox = bounds.bbox;
        const options = bounds.options;
        const mapContainer = mapContainerRef.current;

        if (!bbox || bbox.length < 4 || !mapContainer) return;
        if (mapContainer.offsetWidth <= 0 || mapContainer.offsetHeight <= 0) return;

        const [west, south, east, north] = bbox as [number, number, number, number];

        const { longitude, latitude, zoom } = fitBounds({
            width: mapContainer.offsetWidth,
            height: mapContainer.offsetHeight,
            bounds: [
                [west, south],
                [east, north],
            ],
            ...options,
        });

        setViewState({ ...viewStateRef.current, longitude, latitude, zoom });
    }, [bounds, mapContainerRef, setViewState]);

    useEffect(() => {
        if (
            !isEmpty(bounds) &&
            !!bounds.bbox &&
            bounds.bbox.every((b: unknown) => typeof b === 'number')
        ) {
            handleFitBounds();
        }
    }, [bounds, handleFitBounds]);

    return (
        <WriSearch
            placeholder="Search location"
            options={options}
            isLoading={isLoading}
            displayResults="list"
            onQueryChange={handleQueryChange}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            onSelect={handleSelect as unknown as React.ComponentProps<typeof WriSearch>['onSelect']}
            onClear={() => {
                setOptions([]);
                setFeatures([]);
            }}
        />
    );
}
