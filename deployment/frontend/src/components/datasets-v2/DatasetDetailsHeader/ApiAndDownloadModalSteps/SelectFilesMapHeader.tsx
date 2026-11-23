import {
    Search,
    TabBar,
    type ListItemProps,
    getThemedColor,
    getThemedSpacing,
} from '@worldresources/wri-design-systems';
import { ListBulletIcon, Square3Stack3DIcon } from '@heroicons/react/24/solid';
import { type CSSProperties, useCallback, useEffect, useRef, useState } from 'react';
import MapSearchResults, { type MapSearchResultOption } from './MapSearchResults';
import { MAP_SEARCH_MIN_QUERY_LENGTH } from './useMapGeocoderSearch';

type ViewMode = 'map' | 'list';

const SEARCH_INPUT_WIDTH = 264;

// Floats over the map instead of taking room in the header, so opening the
// results never pushes the map down. The muted surface separates the panel from
// the map canvas it covers, the same way the design system panel does.
const resultsPanelStyle: CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 1000,
    overflow: 'hidden',
    backgroundColor: getThemedColor('neutral', 100),
    border: `1px solid ${getThemedColor('neutral', 300)}`,
    borderRadius: '0.375rem',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
};

// The design system `Input` ships a `margin-bottom` for its label/helper slot,
// which the address bar does not use. Inside this relatively positioned
// container that margin is part of the box, so the panel would hang below the
// field with a gap, and the header would reserve space for it. `Search` spreads
// its remaining props onto the input, so the margin is dropped there.
const searchInputStyle: CSSProperties = { marginBottom: 0 };

type SelectFilesMapHeaderProps = {
    viewMode: ViewMode;
    onViewModeChange: (nextMode: ViewMode) => void;
    mapSearchOptions: ListItemProps[];
    mapSearchQuery: string;
    onMapSearchQueryChange: (query: string) => void;
    onMapSearchSelect: (selectedOption: MapSearchResultOption) => void;
    onMapSearchClear: () => void;
    isLoadingMapSearch: boolean;
    /** Whether the current query is long enough to have been sent to the geocoder. */
    isMapSearchQueryValid: boolean;
    listSearchQuery: string;
    onListSearchQueryChange: (query: string) => void;
};

export default function SelectFilesMapHeader({
    viewMode,
    onViewModeChange,
    mapSearchOptions,
    mapSearchQuery,
    onMapSearchQueryChange,
    onMapSearchSelect,
    onMapSearchClear,
    isLoadingMapSearch,
    isMapSearchQueryValid,
    listSearchQuery,
    onListSearchQueryChange,
}: SelectFilesMapHeaderProps) {
    const handleMapSearchSelect = useCallback(
        (optionId: string) => {
            // `Search` hands back the option id; the label travels with it so the
            // input shows the chosen place instead of the typed query.
            const selectedOption = mapSearchOptions.find(
                (option) => String(option.id ?? option.searchLabel) === optionId
            );
            if (!selectedOption) {
                return;
            }

            const label =
                typeof selectedOption.label === 'string'
                    ? selectedOption.label
                    : (selectedOption.searchLabel ?? optionId);

            onMapSearchSelect({ id: optionId, label });
        },
        [mapSearchOptions, onMapSearchSelect]
    );

    const [isResultsOpen, setIsResultsOpen] = useState(false);
    // Cursor shared with the panel: keyboard moves it, hover mirrors it.
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const searchContainerRef = useRef<HTMLDivElement | null>(null);
    const listSearchRef = useRef<HTMLDivElement | null>(null);

    const closeResults = useCallback(() => setIsResultsOpen(false), []);

    const handleMapSearchQueryChange = useCallback(
        (nextQuery: string) => {
            onMapSearchQueryChange(nextQuery);
            // Cleared (or too short to be sent to the geocoder): nothing to list.
            setIsResultsOpen(nextQuery.trim().length >= MAP_SEARCH_MIN_QUERY_LENGTH);
        },
        [onMapSearchQueryChange]
    );

    // Selection goes through `onMapSearchSelect` (which frames the place and
    // keeps the input label), then closes the panel. Closing is local on
    // purpose: the panel is ours, so no popover state can reopen it.
    const selectOptionById = useCallback(
        (optionId: string) => {
            if (optionId) {
                handleMapSearchSelect(optionId);
            }
            closeResults();
        },
        [closeResults, handleMapSearchSelect]
    );

    // Clear button: drops the query, the form location and the panel in one go.
    const handleSearchClear = useCallback(() => {
        closeResults();
        onMapSearchClear();
    }, [closeResults, onMapSearchClear]);

    // `Search` keeps the typed text in its own state, so after a selection the
    // input would still show the query. Mirroring the committed value (the
    // chosen label or the cleared string) into the DOM input — the same node
    // React renders — keeps the field in sync without remounting the input,
    // which would drop focus and the user's caret.
    useEffect(() => {
        const input =
            searchContainerRef.current?.querySelector<HTMLInputElement>('input[type="search"]');
        if (input && input.value !== mapSearchQuery) {
            input.value = mapSearchQuery;
        }
    }, [mapSearchQuery]);

    // A click anywhere outside the input/panel closes it, mirroring the blur
    // behaviour of the design system panel. Escape closes it too; with
    // `displayResults="none"` `Search` no longer handles that key.
    useEffect(() => {
        if (!isResultsOpen) {
            return;
        }

        const handlePointerDown = (event: MouseEvent) => {
            if (!searchContainerRef.current?.contains(event.target as Node)) {
                closeResults();
            }
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeResults();
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [closeResults, isResultsOpen]);

    // Arrow keys move the cursor over the rows (hover follows it so the
    // highlight and the Enter target always agree); Enter picks it.
    useEffect(() => {
        if (!isResultsOpen) {
            setHighlightedIndex(-1);
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (mapSearchOptions.length === 0) {
                return;
            }

            if (event.key === 'ArrowDown') {
                event.preventDefault();
                setHighlightedIndex((previous) =>
                    Math.min(previous + 1, mapSearchOptions.length - 1)
                );
                return;
            }

            if (event.key === 'ArrowUp') {
                event.preventDefault();
                setHighlightedIndex((previous) => Math.max(previous - 1, 0));
                return;
            }

            if (event.key === 'Enter' && highlightedIndex >= 0) {
                const option = mapSearchOptions[highlightedIndex];
                if (!option) {
                    return;
                }

                event.preventDefault();
                selectOptionById(String(option.id ?? option.searchLabel ?? ''));
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [highlightedIndex, isResultsOpen, mapSearchOptions, selectOptionById]);

    // Same sync for the tile-name search, which also keeps its text internally.
    useEffect(() => {
        const input =
            listSearchRef.current?.querySelector<HTMLInputElement>('input[type="search"]');
        if (input && input.value !== listSearchQuery) {
            input.value = listSearchQuery;
        }
    }, [listSearchQuery]);

    return (
        <div
            style={{
                padding: `${getThemedSpacing(300)} ${getThemedSpacing(400)} ${getThemedSpacing(200)}`,
                display: 'flex',
                flexDirection: 'column',
                gap: getThemedSpacing(200),
                // Anchors the floating results panel (positioned against the
                // search input container, not the whole header).
                position: 'relative',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: getThemedSpacing(400),
                }}
            >
                <div style={{ flex: 1 }}>
                    <TabBar
                        variant="transparent"
                        tabs={[
                            {
                                label: 'Map',
                                value: 'map',
                                icon: <Square3Stack3DIcon width={18} height={18} />,
                            },
                            {
                                label: 'List',
                                value: 'list',
                                icon: <ListBulletIcon width={18} height={18} />,
                            },
                        ]}
                        onTabClick={(value) => onViewModeChange(value as ViewMode)}
                    />
                </div>

                {viewMode === 'map' && (
                    <div
                        ref={searchContainerRef}
                        style={{
                            width: SEARCH_INPUT_WIDTH,
                            flexShrink: 0,
                            position: 'relative',
                        }}
                    >
                        {/* `none` leaves the results panel to us: the built-in one
                         * is portalled away from this container, which made it
                         * unable to close on selection and forced us to track
                         * its open state from the outside. */}
                        <Search
                            options={mapSearchOptions}
                            onQueryChange={handleMapSearchQueryChange}
                            onSelect={(selectedOption) => {
                                // Typed as an option, but the input also emits
                                // events: only options carry an id.
                                if ('id' in selectedOption) {
                                    selectOptionById(
                                        String(
                                            selectedOption.id ?? selectedOption.searchLabel ?? ''
                                        )
                                    );
                                }
                            }}
                            onClear={handleSearchClear}
                            displayResults="none"
                            placeholder="Search files by location"
                            style={searchInputStyle}
                        />

                        {/* `aria-expanded` on the input is owned by `Search` and
                         * stays false with `none`, so the open state lives on
                         * the panel. */}
                        {isResultsOpen && (
                            <div role="presentation" style={resultsPanelStyle}>
                                <MapSearchResults
                                    options={mapSearchOptions}
                                    query={mapSearchQuery}
                                    onSelect={selectOptionById}
                                    isLoading={isLoadingMapSearch}
                                    isQueryValid={isMapSearchQueryValid}
                                    highlightedIndex={highlightedIndex}
                                    onHighlight={setHighlightedIndex}
                                />
                            </div>
                        )}
                    </div>
                )}

                {viewMode === 'list' && (
                    <div ref={listSearchRef} style={{ width: SEARCH_INPUT_WIDTH, flexShrink: 0 }}>
                        <Search
                            options={[]}
                            onQueryChange={onListSearchQueryChange}
                            displayResults="none"
                            placeholder="Search tile name"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
