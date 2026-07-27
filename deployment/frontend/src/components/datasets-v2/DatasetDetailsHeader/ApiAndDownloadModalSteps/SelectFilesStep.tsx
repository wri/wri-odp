import {
    Button,
    getThemedColor,
    getThemedFontSize,
    getThemedSpacing,
} from '@worldresources/wri-design-systems';
import { type WriDataset } from '@/schema/ckan.schema';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import FileCard from './FileCard';
import { formatDate, formatFileSize } from '../download-utils';

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

            {/* Cards */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: getThemedSpacing(400),
                }}
            >
                {datafiles?.map((resource) => (
                    <FileCard
                        key={resource.id}
                        title={resource.title}
                        badge={
                            resource.type === 'data-api-dataset' &&
                            (resource.data_api_tiles?.length ?? 0) > 0
                                ? 'Raster Tile Set'
                                : (resource.format ?? 'FILE')
                        }
                        description={resource.description ?? resource.name ?? ''}
                        extraInfo={
                            resource.size ? `Size: ${formatFileSize(resource.size)}` : undefined
                        }
                        createdAt={formatDate(resource.created)}
                        updatedAt={formatDate(resource.metadata_modified ?? resource.last_modified)}
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
                                {selectedResourceIds.includes(resource.id) ? 'Remove' : 'Add'}
                            </Button>
                        }
                    />
                ))}
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
