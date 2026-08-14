import {
    Search,
    TabBar,
    type ListItemProps,
    getThemedSpacing,
} from '@worldresources/wri-design-systems';
import { ListBulletIcon, Square3Stack3DIcon } from '@heroicons/react/24/solid';
import { type SyntheticEvent } from 'react';

type ViewMode = 'map' | 'list';

type SelectFilesMapHeaderProps = {
    viewMode: ViewMode;
    onViewModeChange: (nextMode: ViewMode) => void;
    mapSearchOptions: ListItemProps[];
    mapSearchQuery: string;
    onMapSearchQueryChange: (query: string) => void;
    onMapSearchSelect: (selectedOption: ListItemProps | SyntheticEvent<HTMLInputElement>) => void;
    onMapSearchClear: () => void;
    isLoadingMapSearch: boolean;
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
    listSearchQuery,
    onListSearchQueryChange,
}: SelectFilesMapHeaderProps) {
    return (
        <div
            style={{
                padding: `${getThemedSpacing(300)} ${getThemedSpacing(400)} ${getThemedSpacing(200)}`,
                display: 'flex',
                flexDirection: 'column',
                gap: getThemedSpacing(200),
                position: 'relative',
                zIndex: 1800,
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
                        style={{
                            width: 264,
                            flexShrink: 0,
                            position: 'relative',
                            zIndex: 1801,
                            overflow: 'visible',
                        }}
                    >
                        <Search
                            options={mapSearchOptions}
                            value={mapSearchQuery}
                            onQueryChange={onMapSearchQueryChange}
                            onSelect={onMapSearchSelect}
                            onClear={onMapSearchClear}
                            isLoading={isLoadingMapSearch}
                            displayResults="list"
                            placeholder="Search files by location"
                        />
                    </div>
                )}

                {viewMode === 'list' && (
                    <div style={{ width: 264, flexShrink: 0 }}>
                        <Search
                            options={[]}
                            value={listSearchQuery}
                            onQueryChange={onListSearchQueryChange}
                            placeholder="Search tile name"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
