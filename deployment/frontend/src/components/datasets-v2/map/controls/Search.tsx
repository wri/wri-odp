import {
    useState,
    useRef,
    useCallback,
    useEffect,
    type CSSProperties,
    type MutableRefObject,
} from 'react';
import type React from 'react';
import type { MapRef } from 'react-map-gl';
import { useDebouncedCallback } from 'use-debounce';
import { useBounds } from '@/utils/storeHooks';
import {
    Search as WriSearch,
    type ListItemProps,
    getThemedColor,
} from '@worldresources/wri-design-systems';
import { type Bounds } from '@/interfaces/state.interface';
import MapSearchResults from '@/components/datasets-v2/DatasetDetailsHeader/ApiAndDownloadModalSteps/MapSearchResults';
import { MAP_SEARCH_MIN_QUERY_LENGTH } from '@/components/datasets-v2/DatasetDetailsHeader/ApiAndDownloadModalSteps/useMapGeocoderSearch';

type GeoFeature = {
    id: string;
    place_name: string;
    bbox?: number[];
    center?: number[];
};

// Trigger the geocoding request only once the user stops typing. World-level
// features rarely change, so we use a generous window and skip repeated queries.
const SEARCH_DEBOUNCE_MS = 400;
const MAX_RESULTS = 8;
const SEARCH_CONTAINER_WIDTH = 264;

// The design system `Search` opens its own popover on every keystroke and filters
// `options` literally against the query of that same render. With asynchronous
// geocoder results that renders an empty dropdown (and closes it again) while the
// request is in flight, so `displayResults="none"` is used and the results panel
// is rendered here, the same way the dataset details header does it.
//
// The panel copies the design system popover (`cD` in the bundle): 1px border in
// neutral-400, the input's bottom corners squared off while open, and a `top`
// taken from the input itself (see `panelTop`), because the field wrapper adds a
// row gap of its own that `top: 100%` would include as empty space.
const getResultsPanelStyle = (panelTop: number): CSSProperties => ({
    position: 'absolute',
    top: panelTop,
    left: 0,
    right: 0,
    zIndex: 1000,
    overflow: 'hidden',
    // Overlaps the input border so the two read as a single control.
    marginTop: '-1px',
    backgroundColor: getThemedColor('neutral', 100),
    border: `1px solid ${getThemedColor('neutral', 400)}`,
    borderRadius: '0 0 0.375rem 0.375rem',
    boxShadow:
        '0 0.25rem 0.375rem -0.25rem rgba(0, 0, 0, 0.1), 0 0.625rem 0.9375rem -0.1875rem rgba(0, 0, 0, 0.1)',
});

// `Search` ships a `margin-bottom` for its label/helper slot, which this control
// does not use; inside the positioned container it would offset the panel. While
// the panel is open the input's bottom corners are squared off so the input and
// the rows read as one control, exactly like the design system popover does. The
// border itself stays: the panel already overlaps it by 1px, so making it
// transparent (as the design system does) would leave a visible gap.
const getSearchInputStyle = (isOpen: boolean): CSSProperties => ({
    marginBottom: 0,
    ...(isOpen ? { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 } : null),
});

const isValidBbox = (bbox?: number[] | null): bbox is [number, number, number, number] =>
    Array.isArray(bbox) && bbox.length === 4 && bbox.every((v) => Number.isFinite(v));

export default function Search({ mapRef }: { mapRef: MutableRefObject<MapRef | null> }) {
    const [query, setQuery] = useState('');
    const [options, setOptions] = useState<ListItemProps[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isResultsOpen, setIsResultsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const { bounds, setBounds } = useBounds();
    // Features of the last received response, keyed by option id.
    const featuresRef = useRef<Map<string, GeoFeature>>(new Map());
    // Keep the latest query so stale/aborted responses can be discarded.
    const latestQueryRef = useRef('');
    const abortControllerRef = useRef<AbortController | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    // Anchor for the results panel: the wrapper is taller than the input (the
    // field component reserves a label/helper slot), so the panel is positioned
    // from the input's own bottom edge instead of `top: 100%`.
    const [panelTop, setPanelTop] = useState<number | null>(null);
    // The last bounds object we already flew to, so we only move the map once
    // per search instead of on every re-render triggered by the store.
    const handledBoundsRef = useRef<number[] | null>(null);

    const clearResults = useCallback(() => {
        featuresRef.current = new Map();
        setOptions([]);
        setIsResultsOpen(false);
        setHighlightedIndex(-1);
        setIsLoading(false);
    }, []);

    const fetchSuggestions = useCallback(
        async (nextQuery: string) => {
            const trimmedQuery = nextQuery.trim();

            if (trimmedQuery.length < MAP_SEARCH_MIN_QUERY_LENGTH) {
                clearResults();
                return;
            }

            abortControllerRef.current?.abort();
            const controller = new AbortController();
            abortControllerRef.current = controller;
            latestQueryRef.current = trimmedQuery;
            setIsLoading(true);

            try {
                const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';
                const res = await fetch(
                    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
                        trimmedQuery
                    )}.json?access_token=${token}&types=country,region,place,locality&limit=${MAX_RESULTS}&language=en`,
                    { signal: controller.signal }
                );

                if (!res.ok) throw new Error(`Geocoding request failed with status ${res.status}`);

                const data = (await res.json()) as { features?: GeoFeature[] };

                // A newer query was issued while this request was in flight.
                if (latestQueryRef.current !== trimmedQuery) return;

                const featureList = (data.features ?? []).filter((feature) =>
                    Boolean(feature.id && feature.place_name)
                );

                featuresRef.current = new Map(featureList.map((feature) => [feature.id, feature]));
                // The rows render straight from these options, so they always match
                // the response instead of being filtered against a stale query.
                setOptions(
                    featureList.map((feature) => ({
                        id: feature.id,
                        label: feature.place_name,
                        searchLabel: feature.place_name,
                        variant: 'select',
                    }))
                );
                setHighlightedIndex(-1);
            } catch {
                // Aborted requests land here too: leave the last results alone.
            } finally {
                if (latestQueryRef.current === trimmedQuery) setIsLoading(false);
            }
        },
        [clearResults]
    );

    // Created once and reading the latest callback through a ref, because
    // `useDebouncedCallback` restarts its pending timer whenever `func` changes.
    const fetchSuggestionsRef = useRef(fetchSuggestions);
    fetchSuggestionsRef.current = fetchSuggestions;

    const debouncedFetchSuggestions = useDebouncedCallback((nextQuery: string) => {
        void fetchSuggestionsRef.current(nextQuery);
    }, SEARCH_DEBOUNCE_MS);

    const handleQueryChange = useCallback(
        (nextQuery: string) => {
            setQuery(nextQuery);
            setHighlightedIndex(-1);

            if (!nextQuery.trim()) {
                debouncedFetchSuggestions.cancel();
                latestQueryRef.current = '';
                clearResults();
                return;
            }

            setIsResultsOpen(true);
            debouncedFetchSuggestions(nextQuery);
        },
        [clearResults, debouncedFetchSuggestions]
    );

    const selectOption = useCallback(
        (optionId: string) => {
            const feature = featuresRef.current.get(optionId);
            if (!feature) return;

            const bbox = isValidBbox(feature.bbox)
                ? feature.bbox
                : (() => {
                      const [lng, lat] = (feature.center ?? []) as [number?, number?];
                      return typeof lng === 'number' && typeof lat === 'number'
                          ? ([lng, lat, lng, lat] as [number, number, number, number])
                          : null;
                  })();

            if (!bbox) return;

            setBounds({ bbox, options: { zoom: 2 } });
            // The panel is ours, so it closes locally; no popover can reopen it.
            setIsResultsOpen(false);
        },
        [setBounds]
    );

    // Drop any pending debounce and in-flight request when the control unmounts.
    useEffect(
        () => () => {
            abortControllerRef.current?.abort();
            debouncedFetchSuggestions.cancel();
        },
        [debouncedFetchSuggestions]
    );

    // Clicking outside the control closes the results panel.
    useEffect(() => {
        if (!isResultsOpen) return;

        const handlePointerDown = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) setIsResultsOpen(false);
        };

        document.addEventListener('mousedown', handlePointerDown);
        return () => document.removeEventListener('mousedown', handlePointerDown);
    }, [isResultsOpen]);

    // Measure the input so the panel starts exactly at its bottom border, however
    // much room the field wrapper reserves below it. The input is queried instead
    // of referenced because `Search` only forwards `style` to it, not refs.
    const measurePanelTop = useCallback(() => {
        const container = containerRef.current;
        const input = container?.querySelector<HTMLInputElement>('input');
        if (!container || !input) return;

        const offset = input.getBoundingClientRect().bottom - container.getBoundingClientRect().top;
        setPanelTop(Math.round(offset));
    }, []);

    // Re-measure once after mount (the input height is known after layout), every
    // time the panel opens, and on resize, so the panel always starts at the
    // input's bottom edge instead of the field wrapper's.
    useEffect(() => {
        measurePanelTop();

        const container = containerRef.current;
        if (!container || typeof ResizeObserver === 'undefined') return;

        const observer = new ResizeObserver(measurePanelTop);
        observer.observe(container);
        return () => observer.disconnect();
    }, [isResultsOpen, measurePanelTop]);

    useEffect(() => {
        // `bounds` can be missing at runtime when the store is (re)hydrated with a
        // partial `mapView` (e.g. shared/embed links decoded from the `map` param).
        const mapViewBounds: Partial<Bounds> = bounds ?? {};
        const bbox = mapViewBounds.bbox;
        const map = mapRef.current;

        if (!isValidBbox(bbox) || !map) return;
        // Guard against reacting to the same bounds more than once.
        if (handledBoundsRef.current === bbox) return;

        handledBoundsRef.current = bbox;

        const [west, south, east, north] = bbox;

        map.fitBounds(
            [
                [west, south],
                [east, north],
            ],
            {
                padding: 40,
                duration: 1000,
                ...mapViewBounds.options,
            }
        );
    }, [bounds, mapRef]);

    return (
        <div ref={containerRef} style={{ width: SEARCH_CONTAINER_WIDTH, position: 'relative' }}>
            <WriSearch
                placeholder="Search location"
                // `none` leaves the results panel to us: the built-in one filters
                // `options` against the query of the current render, which cannot
                // work with results that arrive asynchronously. `options` stays
                // empty because the rows are rendered by `MapSearchResults`.
                options={[]}
                displayResults="none"
                onQueryChange={handleQueryChange}
                // Typed as an option, but the input also emits events: only
                // options carry an id.
                onSelect={
                    ((selected: ListItemProps | React.ChangeEvent<HTMLInputElement>) => {
                        if (selected && typeof selected === 'object' && 'id' in selected) {
                            selectOption(String(selected.id ?? ''));
                        }
                    }) as React.ComponentProps<typeof WriSearch>['onSelect']
                }
                onClear={() => handleQueryChange('')}
                style={getSearchInputStyle(isResultsOpen)}
            />

            {isResultsOpen && panelTop !== null && (
                <div role="presentation" style={getResultsPanelStyle(panelTop)}>
                    <MapSearchResults
                        options={options}
                        query={query}
                        onSelect={selectOption}
                        isLoading={isLoading}
                        isQueryValid={query.trim().length >= MAP_SEARCH_MIN_QUERY_LENGTH}
                        highlightedIndex={highlightedIndex}
                        onHighlight={setHighlightedIndex}
                    />
                </div>
            )}
        </div>
    );
}
