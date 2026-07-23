import {
    Button,
    getThemedColor,
    getThemedFontSize,
    getThemedSpacing,
} from '@worldresources/wri-design-systems';
import { type WriDataset } from '@/schema/ckan.schema';
import { PlusIcon } from '@heroicons/react/24/outline';
import FileCard from './FileCard';

type SelectFilesStepProps = {
    dataset: WriDataset;
    onBack: () => void;
    onContinue: () => void;
};

function SelectFilesStep({ dataset, onBack, onContinue }: SelectFilesStepProps) {
    const datafiles = dataset?.resources;

    const formatDate = (value?: string | null) => {
        if (!value) {
            return '';
        }

        return new Date(value).toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
        });
    };

    const formatSize = (value?: number | null) => {
        if (!value) {
            return '';
        }

        if (value < 1024) {
            return `${value} B`;
        }

        const sizeInKb = value / 1024;

        if (sizeInKb < 1024) {
            return `${sizeInKb.toFixed(1)} KB`;
        }

        return `${(sizeInKb / 1024).toFixed(1)} MB`;
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
                        extraInfo={resource.size ? `Size: ${formatSize(resource.size)}` : undefined}
                        createdAt={formatDate(resource.created)}
                        updatedAt={formatDate(resource.metadata_modified ?? resource.last_modified)}
                        rightContent={
                            <Button
                                variant="secondary"
                                size="default"
                                leftIcon={<PlusIcon />}
                                onClick={() => console.log(resource.title)}
                            >
                                Add
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
                <Button variant="primary" size="default" onClick={onContinue}>
                    Continue
                </Button>
            </div>
        </div>
    );
}

export default SelectFilesStep;
