export function formatFileSize(value?: number | null): string {
    if (value === null || value === undefined) {
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
}

export function formatDate(value?: string | null): string {
    if (!value) {
        return '';
    }

    return new Date(value).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    });
}

type ResourceLike = {
    type?: string | null;
    data_api_tiles?: unknown[] | null;
    format?: string | null;
};

export function getResourceFormatLabel(resource: ResourceLike): string {
    if (resource.type === 'data-api-dataset' && (resource.data_api_tiles?.length ?? 0) > 0) {
        return 'Raster Tile Set';
    }

    return resource.format ?? 'FILE';
}
