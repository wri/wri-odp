import {
    Button,
    getThemedColor,
    getThemedFontSize,
    getThemedRadius,
    getThemedSpacing,
    TabBar,
    Tag,
} from '@worldresources/wri-design-systems';
import {
    ChevronDownIcon,
    ClipboardDocumentIcon,
    ArrowTopRightOnSquareIcon,
    PlusIcon,
    TrashIcon,
    Squares2X2Icon,
} from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { env } from '@/env.mjs';
import { type WriDataset } from '@/schema/ckan.schema';
import { type Resource } from '@/interfaces/dataset.interface';
import { formatDate } from '../download-utils';
import { useFields } from '@/components/data-explorer/queryHooks';
import { useForm } from 'react-hook-form';
import { api } from '@/utils/api';
import {
    buildEndpoints,
    getSnippetByEndpoint,
    normalizeBaseUrl,
    type CodeTab,
} from './selectEndpoints.utils';
import { type LocationSearchFormType, type TileGeojson } from './SelectFilesMap';

const SelectFilesMap = dynamic(() => import('./SelectFilesMap'), {
    ssr: false,
});

type SelectEndpointsProps = {
    dataset: WriDataset;
    onBack: () => void;
    onClose: () => void;
};

function SelectEndpoints({ dataset, onBack, onClose }: SelectEndpointsProps) {
    const [expandedByIndex, setExpandedByIndex] = useState<Record<number, boolean>>({});
    const [selectedTabByIndex, setSelectedTabByIndex] = useState<Record<number, CodeTab>>({});
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [selectedMapResourceId, setSelectedMapResourceId] = useState<string | null>(null);
    const [selectedMapTab, setSelectedMapTab] = useState<CodeTab>('javascript');

    const { data } = useFields({
        id: dataset.rw_id ?? '',
        provider: dataset.provider ?? '',
    });

    const formObj = useForm<LocationSearchFormType>({
        defaultValues: {
            bbox: null,
            point: null,
            location: '',
        },
    });

    const watchedBbox = formObj.watch('bbox');
    const watchedPoint = formObj.watch('point');
    const watchedLocation = formObj.watch('location');

    const publicCkanUrl = normalizeBaseUrl(env.NEXT_PUBLIC_CKAN_URL);
    const ckanBaseUrl = `${publicCkanUrl}/api/3/action`;
    const rwBaseUrl = 'https://api.resourcewatch.org/v1';

    const endpoints = buildEndpoints({
        dataset,
        ckanBaseUrl,
        rwBaseUrl,
        tableName: data?.tableName,
    });

    const geoSpatialResources = useMemo(
        () =>
            dataset.resources
                .filter((resource) => resource.spatial_type !== 'global')
                .filter((resource) => (resource.spatial_address ?? resource.spatial_geom) != null),
        [dataset.resources]
    );

    const geojsons = useMemo<TileGeojson[]>(() => {
        return geoSpatialResources.map((resource) => {
            const spatialGeom = (resource.spatial_geom ?? {}) as Record<string, unknown>;

            return {
                ...spatialGeom,
                address: resource.spatial_address,
                selected: selectedMapResourceId === resource.id,
                id: resource.id,
                datafile: resource,
            };
        });
    }, [geoSpatialResources, selectedMapResourceId]);

    const showMapCard = Boolean(dataset.is_approved && geojsons.length > 0);
    const hasLocationFilter =
        Boolean(watchedLocation?.trim()) ||
        Boolean(watchedPoint && watchedPoint.length > 0) ||
        Boolean(watchedBbox && watchedBbox.length > 0);

    api.dataset.resourceLocationSearch.useQuery(
        {
            bbox: watchedBbox,
            point: watchedPoint,
            location: watchedLocation,
            package_id: dataset.name,
            is_pending: false,
        },
        {
            enabled: showMapCard && hasLocationFilter,
            onSuccess: (resources) => {
                const firstResult = resources?.[0];
                if (firstResult) {
                    setSelectedMapResourceId(firstResult.id);
                }
                formObj.reset();
            },
        }
    );

    const toggleResourceByMap = (resource: Resource) => {
        setSelectedMapResourceId((current) => (current === resource.id ? null : resource.id));
    };

    const handleMapCardButton = () => {
        if (!isMapOpen) {
            setIsMapOpen(true);
            return;
        }

        setSelectedMapResourceId(null);
        setIsMapOpen(false);
    };

    const selectedMapEndpoint =
        endpoints.find((endpoint) => endpoint.resource?.id === selectedMapResourceId) ?? null;
    const nonResourceEndpoints = endpoints.filter((endpoint) => !endpoint.resource);

    const mapCardDescription =
        ('function' in dataset ? (dataset as { function?: string }).function : undefined) ??
        dataset.short_description ??
        '';

    const copyEndpoint = async (url: string) => {
        await navigator.clipboard.writeText(url);
    };

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: getThemedSpacing(500),
            }}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: getThemedSpacing(200),
                }}
            >
                <h1
                    style={{
                        fontSize: getThemedFontSize(700),
                        fontWeight: 700,
                        color: getThemedColor('neutral', 900),
                    }}
                >
                    Select endpoints
                </h1>
                <p
                    style={{
                        fontSize: getThemedFontSize(400),
                        color: getThemedColor('neutral', 800),
                    }}
                >
                    Choose one or more API end points to connect to.
                </p>
            </div>

            {showMapCard && (
                <div
                    style={{
                        border: `1px solid ${getThemedColor('neutral', 300)}`,
                        borderRadius: getThemedRadius(300),
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            padding: getThemedSpacing(400),
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            gap: getThemedSpacing(300),
                            borderBottom: isMapOpen
                                ? `1px solid ${getThemedColor('neutral', 300)}`
                                : undefined,
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: getThemedSpacing(200),
                                    flexWrap: 'wrap',
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: getThemedFontSize(500),
                                        fontWeight: 700,
                                        color: getThemedColor('neutral', 900),
                                    }}
                                >
                                    {(dataset.title ?? dataset.name) + ' GeoTIFF tiles'}
                                </span>
                                <Tag label="GeoTIFF tile set" variant="success" />
                            </div>
                            <p
                                style={{
                                    fontSize: getThemedFontSize(400),
                                    color: getThemedColor('neutral', 800),
                                    marginTop: getThemedSpacing(100),
                                }}
                            >
                                {mapCardDescription}
                            </p>
                            <div
                                style={{
                                    fontSize: getThemedFontSize(300),
                                    color: getThemedColor('neutral', 700),
                                    marginTop: getThemedSpacing(100),
                                    display: 'flex',
                                    gap: getThemedSpacing(400),
                                }}
                            >
                                <span>Created: {formatDate(dataset.metadata_modified)}</span>
                                <span>Last updated: {formatDate(dataset.metadata_modified)}</span>
                            </div>
                        </div>

                        <Button
                            variant={!isMapOpen ? 'secondary' : 'negative'}
                            size="default"
                            leftIcon={!isMapOpen ? <PlusIcon /> : <TrashIcon />}
                            onClick={handleMapCardButton}
                        >
                            {isMapOpen ? 'Remove' : 'Add and configure'}
                        </Button>
                    </div>

                    {isMapOpen && (
                        <>
                            <SelectFilesMap
                                geojsons={geojsons}
                                formObj={formObj}
                                onToggleResource={toggleResourceByMap}
                            />

                            <div
                                style={{
                                    padding: getThemedSpacing(400),
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: getThemedSpacing(400),
                                    borderTop: `1px solid ${getThemedColor('neutral', 300)}`,
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: getThemedFontSize(400),
                                        color: getThemedColor('neutral', 900),
                                        fontWeight: 700,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: getThemedSpacing(200),
                                    }}
                                >
                                    <Squares2X2Icon width={16} height={16} />
                                    {selectedMapEndpoint
                                        ? `Selected tile: "${
                                              selectedMapEndpoint.resource?.name ??
                                              selectedMapEndpoint.resource?.title ??
                                              selectedMapEndpoint.resource?.id ??
                                              ''
                                          }"`
                                        : 'No tile selected'}
                                </div>
                                {!selectedMapEndpoint && (
                                    <div
                                        style={{
                                            fontWeight: 400,
                                            color: getThemedColor('neutral', 700),
                                        }}
                                    >
                                        Select a tile above to generate an endpoint.
                                    </div>
                                )}
                                {selectedMapEndpoint && (
                                    <>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: getThemedSpacing(200),
                                            }}
                                        >
                                            <div
                                                style={{
                                                    flex: 1,
                                                    border: `1px solid ${getThemedColor('neutral', 300)}`,
                                                    borderRadius: getThemedRadius(200),
                                                    background: getThemedColor('neutral', 100),
                                                    padding: `${getThemedSpacing(200)} ${getThemedSpacing(300)}`,
                                                    fontSize: getThemedFontSize(400),
                                                    color: getThemedColor('neutral', 600),
                                                    overflow: 'hidden',
                                                    whiteSpace: 'nowrap',
                                                    textOverflow: 'ellipsis',
                                                }}
                                            >
                                                {selectedMapEndpoint.url}
                                            </div>
                                            <Button
                                                variant="secondary"
                                                size="default"
                                                leftIcon={<ClipboardDocumentIcon />}
                                                onClick={() =>
                                                    copyEndpoint(selectedMapEndpoint.url)
                                                }
                                            >
                                                Copy
                                            </Button>
                                        </div>

                                        <div>
                                            <TabBar
                                                variant="transparent"
                                                tabs={[
                                                    {
                                                        label: 'Javascript',
                                                        value: 'javascript',
                                                    },
                                                    { label: 'Python', value: 'python' },
                                                    { label: 'R', value: 'r' },
                                                ]}
                                                onTabClick={(value) =>
                                                    setSelectedMapTab(value as CodeTab)
                                                }
                                            />

                                            <div
                                                style={{
                                                    background: getThemedColor('neutral', 200),
                                                    borderRadius: getThemedRadius(300),
                                                    padding: getThemedSpacing(400),
                                                    fontSize: getThemedFontSize(400),
                                                    color: getThemedColor('neutral', 800),
                                                    lineHeight: '1.55',
                                                    whiteSpace: 'pre-wrap',
                                                    marginBottom: getThemedSpacing(200),
                                                }}
                                            >
                                                {getSnippetByEndpoint({
                                                    endpoint: selectedMapEndpoint,
                                                    tab: selectedMapTab,
                                                    ckanBaseUrl,
                                                })}
                                            </div>
                                            <Button
                                                variant="secondary"
                                                size="default"
                                                rightIcon={<ArrowTopRightOnSquareIcon />}
                                                onClick={() =>
                                                    window.open(
                                                        'https://www.globalforestwatch.org/help/developers/guides/create-and-use-an-api-key/',
                                                        '_blank'
                                                    )
                                                }
                                            >
                                                Global Forest Watch API docs
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}

            {(showMapCard ? nonResourceEndpoints : endpoints).map((endpoint, index) => {
                const isExpanded = expandedByIndex[index] ?? false;
                const selectedTab = selectedTabByIndex[index] ?? 'javascript';

                return (
                    <div
                        key={endpoint.url}
                        style={{
                            border: `1px solid ${getThemedColor('neutral', 300)}`,
                            borderRadius: getThemedRadius(300),
                            padding: getThemedSpacing(400),
                            display: 'flex',
                            flexDirection: 'column',
                            gap: getThemedSpacing(400),
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: getThemedSpacing(400),
                            }}
                        >
                            <div style={{ flex: 1 }}>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: getThemedSpacing(200),
                                        marginBottom: getThemedSpacing(100),
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: getThemedFontSize(200),
                                            fontWeight: 700,
                                            color: getThemedColor('secondary', 900),
                                            background: getThemedColor('secondary', 200),
                                            borderRadius: getThemedRadius(100),
                                            padding: `2px ${getThemedSpacing(100)}`,
                                        }}
                                    >
                                        GET
                                    </span>
                                    <span
                                        style={{
                                            fontSize: getThemedFontSize(500),
                                            fontWeight: 700,
                                            color: getThemedColor('neutral', 800),
                                        }}
                                    >
                                        {endpoint.resource?.title ?? endpoint.title}
                                    </span>
                                </div>
                                <p
                                    style={{
                                        fontSize: getThemedFontSize(400),
                                        color: getThemedColor('neutral', 800),
                                        marginBottom: getThemedSpacing(300),
                                    }}
                                >
                                    {endpoint.description}
                                </p>
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: getThemedSpacing(300),
                                        fontSize: getThemedFontSize(300),
                                        color: getThemedColor('neutral', 700),
                                    }}
                                >
                                    <span>Created: {formatDate(dataset.metadata_modified)}</span>
                                    <span>
                                        Last updated: {formatDate(dataset.metadata_modified)}
                                    </span>
                                </div>
                            </div>
                            <Button
                                variant="secondary"
                                size="default"
                                rightIcon={<ChevronDownIcon />}
                                onClick={() =>
                                    setExpandedByIndex((current) => ({
                                        ...current,
                                        [index]: !isExpanded,
                                    }))
                                }
                            >
                                {isExpanded ? 'Hide endpoint' : 'Show endpoint'}
                            </Button>
                        </div>

                        {isExpanded && (
                            <>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: getThemedSpacing(200),
                                    }}
                                >
                                    <div
                                        style={{
                                            flex: 1,
                                            border: `1px solid ${getThemedColor('neutral', 300)}`,
                                            borderRadius: getThemedRadius(200),
                                            background: getThemedColor('neutral', 100),
                                            padding: `${getThemedSpacing(200)} ${getThemedSpacing(300)}`,
                                            fontSize: getThemedFontSize(400),
                                            color: getThemedColor('neutral', 600),
                                            overflow: 'hidden',
                                            whiteSpace: 'nowrap',
                                            textOverflow: 'ellipsis',
                                        }}
                                    >
                                        {endpoint.url}
                                    </div>
                                    <Button
                                        variant="secondary"
                                        size="default"
                                        leftIcon={<ClipboardDocumentIcon />}
                                        onClick={() => copyEndpoint(endpoint.url)}
                                    >
                                        Copy
                                    </Button>
                                </div>

                                <div>
                                    <TabBar
                                        variant="transparent"
                                        tabs={[
                                            { label: 'Javascript', value: 'javascript' },
                                            { label: 'Python', value: 'python' },
                                            { label: 'R', value: 'r' },
                                        ]}
                                        onTabClick={(value) =>
                                            setSelectedTabByIndex((current) => ({
                                                ...current,
                                                [index]: value as CodeTab,
                                            }))
                                        }
                                    />

                                    <div
                                        style={{
                                            background: getThemedColor('neutral', 200),
                                            borderRadius: getThemedRadius(300),
                                            padding: getThemedSpacing(400),
                                            fontSize: getThemedFontSize(400),
                                            color: getThemedColor('neutral', 800),
                                            lineHeight: '1.55',
                                            whiteSpace: 'pre-wrap',
                                            marginBottom: getThemedSpacing(400),
                                        }}
                                    >
                                        {getSnippetByEndpoint({
                                            endpoint,
                                            tab: selectedTab,
                                            ckanBaseUrl,
                                        })}
                                    </div>

                                    <div style={{ display: 'flex', gap: getThemedSpacing(200) }}>
                                        <Button
                                            variant="secondary"
                                            size="default"
                                            rightIcon={<ArrowTopRightOnSquareIcon />}
                                            onClick={() =>
                                                window.open(
                                                    'https://docs.ckan.org/en/2.10/api/index.html',
                                                    '_blank'
                                                )
                                            }
                                        >
                                            CKAN auth docs
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="default"
                                            rightIcon={<ArrowTopRightOnSquareIcon />}
                                            onClick={() =>
                                                window.open(
                                                    'https://docs.ckan.org/en/2.10/maintaining/datastore.html',
                                                    '_blank'
                                                )
                                            }
                                        >
                                            Datastore API docs
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                );
            })}

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button variant="secondary" size="default" onClick={onBack}>
                    Back
                </Button>
                <Button variant="primary" size="default" onClick={onClose}>
                    Close
                </Button>
            </div>
        </div>
    );
}

export default SelectEndpoints;
