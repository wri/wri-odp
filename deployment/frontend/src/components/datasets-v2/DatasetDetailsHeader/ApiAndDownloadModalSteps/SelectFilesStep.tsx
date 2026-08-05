import {
    Button,
    getThemedColor,
    getThemedFontSize,
    getThemedRadius,
    getThemedSpacing,
} from '@worldresources/wri-design-systems';
import { type WriDataset } from '@/schema/ckan.schema';
import { type Resource } from '@/interfaces/dataset.interface';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '@/utils/api';
import FileCard from './FileCard';
import { formatDate, formatFileSize, getResourceFormatLabel } from '../download-utils';
import { type LocationSearchFormType, type TileGeojson } from './SelectFilesMap';

const SelectFilesMap = dynamic(() => import('./SelectFilesMap'), {
    ssr: false,
});

type SelectFilesStepProps = {
    dataset: WriDataset;
    selectedResourceIds: string[];
    onToggleResource: (resourceId: string) => void;
    onBack: () => void;
    onContinue: () => void;
};

function SelectFilesStep({
    dataset,
    selectedResourceIds,
    onToggleResource,
    onBack,
    onContinue,
}: SelectFilesStepProps) {
    const datafiles = dataset?.resources;
    const selectableResources = (datafiles ?? []).filter(
        (resource) => Boolean(resource.key) || Boolean(resource.url)
    );
    const geoSpatialResources = selectableResources
        .filter((resource) => resource.spatial_type !== 'global')
        .filter((resource) => (resource.spatial_address ?? resource.spatial_geom) != null);
    const datasetDisplayName = dataset.title ?? dataset.name;
    const datasetFunction =
        'function' in dataset ? (dataset as { function?: string }).function : undefined;
    const mapCardDescription = datasetFunction ?? dataset.short_description ?? '';
    const [isMapOpen, setIsMapOpen] = useState(false);

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
    const hasLocationFilter =
        Boolean(watchedLocation?.trim()) ||
        Boolean(watchedPoint && watchedPoint.length > 0) ||
        Boolean(watchedBbox && watchedBbox.length > 0);

    const addResourcesToSelection = (resources: Resource[]) => {
        resources.forEach((resource) => {
            if (!selectedResourceIds.includes(resource.id)) {
                onToggleResource(resource.id);
            }
        });
    };

    api.dataset.resourceLocationSearch.useQuery(
        {
            bbox: watchedBbox,
            point: watchedPoint,
            location: watchedLocation,
            package_id: dataset.name,
            is_pending: false,
        },
        {
            enabled: hasLocationFilter,
            onSuccess: (resources) => {
                addResourcesToSelection(resources ?? []);
                formObj.reset();
            },
        }
    );

    const geojsons = useMemo<TileGeojson[]>(() => {
        return geoSpatialResources.map((resource) => {
            const spatialGeom = (resource.spatial_geom ?? {}) as Omit<
                TileGeojson,
                'id' | 'datafile' | 'address' | 'selected'
            >;

            return {
                ...spatialGeom,
                address: resource.spatial_address,
                selected: selectedResourceIds.includes(resource.id),
                id: resource.id,
                datafile: resource,
            };
        });
    }, [geoSpatialResources, selectedResourceIds]);

    const showMapCard = Boolean(dataset.is_approved && geojsons.length > 0);

    const toggleResourceByMap = (resource: Resource) => {
        onToggleResource(resource.id);
    };

    const handleMapCardButton = () => {
        if (!isMapOpen) {
            setIsMapOpen(true);
            return;
        }

        geoSpatialResources.forEach((resource) => {
            if (selectedResourceIds.includes(resource.id)) {
                onToggleResource(resource.id);
            }
        });

        setIsMapOpen(false);
    };

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: getThemedSpacing(500),
            }}
        >
            {/* Header */}
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
                    Select files
                </h1>
                <p
                    style={{
                        fontSize: getThemedFontSize(400),
                        fontWeight: 400,
                        color: getThemedColor('neutral', 800),
                    }}
                >
                    Choose one or more data resources to download.
                </p>
            </div>

            {showMapCard && (
                <div
                    style={{
                        border: `1px solid ${getThemedColor('neutral', 300)}`,
                        borderRadius: getThemedRadius(400),
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            padding: getThemedSpacing(400),
                            borderBottom: isMapOpen
                                ? `1px solid ${getThemedColor('neutral', 300)}`
                                : undefined,
                        }}
                    >
                        <FileCard
                            title={`${datasetDisplayName} GeoTIFF tiles`}
                            titleFontSize={getThemedFontSize(500)}
                            badge="GeoTIFF tile set"
                            description={mapCardDescription}
                            createdAt={formatDate(dataset.metadata_modified)}
                            updatedAt={formatDate(dataset.metadata_modified)}
                            borderless
                            rightContent={
                                <Button
                                    variant={!isMapOpen ? 'secondary' : 'negative'}
                                    size="default"
                                    leftIcon={!isMapOpen ? <PlusIcon /> : <TrashIcon />}
                                    onClick={handleMapCardButton}
                                >
                                    {isMapOpen ? 'Remove' : 'Add and configure'}
                                </Button>
                            }
                        />
                    </div>

                    {isMapOpen && (
                        <SelectFilesMap
                            geojsons={geojsons}
                            formObj={formObj}
                            onToggleResource={toggleResourceByMap}
                        />
                    )}
                </div>
            )}

            {/* Cards */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: getThemedSpacing(400),
                }}
            >
                {!showMapCard &&
                    selectableResources.map((resource) => {
                        const isExternallyHosted = Boolean(resource.not_downloadable);

                        return (
                            <FileCard
                                key={resource.id}
                                title={resource.title ?? resource.name ?? 'Selected file'}
                                badge={
                                    isExternallyHosted
                                        ? 'Hosted Externally'
                                        : getResourceFormatLabel(resource)
                                }
                                description={resource.description ?? resource.name ?? ''}
                                extraInfo={
                                    resource.size
                                        ? `Size: ${formatFileSize(resource.size)}`
                                        : undefined
                                }
                                createdAt={formatDate(resource.created)}
                                updatedAt={formatDate(
                                    resource.metadata_modified ?? resource.last_modified
                                )}
                                warningMessage={
                                    isExternallyHosted
                                        ? 'This resource is hosted externally. A link to the file will be included in your download bundle.'
                                        : undefined
                                }
                                rightContent={
                                    <Button
                                        variant={
                                            selectedResourceIds.includes(resource.id)
                                                ? 'negative'
                                                : 'secondary'
                                        }
                                        size="default"
                                        leftIcon={
                                            selectedResourceIds.includes(resource.id) ? (
                                                <TrashIcon />
                                            ) : (
                                                <PlusIcon />
                                            )
                                        }
                                        onClick={() => onToggleResource(resource.id)}
                                    >
                                        {selectedResourceIds.includes(resource.id)
                                            ? 'Remove'
                                            : 'Add'}
                                    </Button>
                                }
                            />
                        );
                    })}
            </div>

            {/* Button group */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button variant="secondary" size="default" onClick={onBack}>
                    Back
                </Button>
                <Button
                    variant="primary"
                    size="default"
                    onClick={onContinue}
                    disabled={selectedResourceIds.length === 0}
                >
                    Continue
                </Button>
            </div>
        </div>
    );
}

export default SelectFilesStep;
