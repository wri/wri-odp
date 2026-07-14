import { type Resource } from '@/interfaces/dataset.interface';
import { type WriDataset } from '@/schema/ckan.schema';

type GeoJsonGeometry = {
    type: string;
    coordinates?: unknown;
};

type GeoJson = {
    type: string;
    geometry?: GeoJsonGeometry;
    features?: GeoJson[];
    coordinates?: unknown;
};

export type DatasetJsonLdOutput = {
    name: string;
    description: string;
    url?: string;
    license?: string;
    keywords?: string[];
    temporalCoverage?: string;
    spatialCoverage?: string | Record<string, unknown>;
    distribution?: Array<{
        '@type': 'DataDownload';
        contentUrl: string;
        encodingFormat?: string;
        name?: string;
    }>;
    creator?: Record<string, unknown> | Array<Record<string, unknown>>;
    isAccessibleForFree?: boolean;
    dateModified?: string;
    includedInDataCatalog?: {
        '@type': 'DataCatalog';
        name: string;
        url: string;
    };
};

type Bounds = {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
};

function isHttpUrl(value: string | undefined): value is string {
    return !!value && /^https?:\/\//i.test(value);
}

function normalizeTemporalValue(
    value: string | number | null | undefined
): string | undefined {
    if (value === null || value === undefined || value === '') {
        return undefined;
    }
    return String(value).trim();
}

export function formatTemporalCoverage(
    start: string | number | null | undefined,
    end: string | number | null | undefined
): string | undefined {
    const startValue = normalizeTemporalValue(start);
    const endValue = normalizeTemporalValue(end);

    if (startValue && endValue) {
        return `${startValue}/${endValue}`;
    }
    if (startValue) {
        return `${startValue}/..`;
    }
    if (endValue) {
        return `../${endValue}`;
    }
    return undefined;
}

function initBounds(): Bounds {
    return {
        minLat: Infinity,
        maxLat: -Infinity,
        minLon: Infinity,
        maxLon: -Infinity,
    };
}

function extendBounds(bounds: Bounds, lon: number, lat: number) {
    bounds.minLat = Math.min(bounds.minLat, lat);
    bounds.maxLat = Math.max(bounds.maxLat, lat);
    bounds.minLon = Math.min(bounds.minLon, lon);
    bounds.maxLon = Math.max(bounds.maxLon, lon);
}

function walkCoordinates(coords: unknown, bounds: Bounds) {
    if (!Array.isArray(coords)) {
        return;
    }
    if (coords.length >= 2 && typeof coords[0] === 'number') {
        const [lon, lat] = coords as [number, number];
        extendBounds(bounds, lon, lat);
        return;
    }
    for (const part of coords) {
        walkCoordinates(part, bounds);
    }
}

function boundsFromGeometry(geometry: GeoJsonGeometry | undefined): Bounds | null {
    if (!geometry?.coordinates) {
        return null;
    }
    const bounds = initBounds();
    walkCoordinates(geometry.coordinates, bounds);
    if (!Number.isFinite(bounds.minLat)) {
        return null;
    }
    return bounds;
}

function boundsToGeoShape(bounds: Bounds) {
    return {
        '@type': 'GeoShape',
        box: `${bounds.minLat} ${bounds.minLon} ${bounds.maxLat} ${bounds.maxLon}`,
    };
}

function geoJsonToSpatialCoverage(
    geoJson: GeoJson | null | undefined
): Record<string, unknown> | undefined {
    if (!geoJson || typeof geoJson !== 'object') {
        return undefined;
    }

    if (geoJson.type === 'FeatureCollection' && Array.isArray(geoJson.features)) {
        const bounds = initBounds();
        for (const feature of geoJson.features) {
            const featureBounds = boundsFromGeometry(feature.geometry);
            if (!featureBounds) {
                continue;
            }
            extendBounds(bounds, featureBounds.minLon, featureBounds.minLat);
            extendBounds(bounds, featureBounds.maxLon, featureBounds.maxLat);
        }
        if (!Number.isFinite(bounds.minLat)) {
            return undefined;
        }
        return {
            '@type': 'Place',
            geo: boundsToGeoShape(bounds),
        };
    }

    if (geoJson.type === 'Feature') {
        const geometry = geoJson.geometry;
        if (geometry?.type === 'Point' && Array.isArray(geometry.coordinates)) {
            const [lon, lat] = geometry.coordinates as [number, number];
            return {
                '@type': 'Place',
                geo: {
                    '@type': 'GeoCoordinates',
                    latitude: lat,
                    longitude: lon,
                },
            };
        }
        const bounds = boundsFromGeometry(geometry);
        if (!bounds) {
            return undefined;
        }
        return {
            '@type': 'Place',
            geo: boundsToGeoShape(bounds),
        };
    }

    if (geoJson.type === 'Point' && Array.isArray(geoJson.coordinates)) {
        const [lon, lat] = geoJson.coordinates as [number, number];
        return {
            '@type': 'Place',
            geo: {
                '@type': 'GeoCoordinates',
                latitude: lat,
                longitude: lon,
            },
        };
    }

    const bounds = boundsFromGeometry(geoJson as GeoJsonGeometry);
    if (!bounds) {
        return undefined;
    }
    return {
        '@type': 'Place',
        geo: boundsToGeoShape(bounds),
    };
}

export function buildSpatialCoverage(dataset: {
    spatial_type?: string;
    spatial_address?: string;
    spatial?: GeoJson | null;
    resources?: Resource[];
}): string | Record<string, unknown> | undefined {
    const spatialType = dataset.spatial_type;
    const spatialAddress = dataset.spatial_address?.trim();

    if (
        spatialType === 'global' ||
        spatialAddress?.toLowerCase() === 'global'
    ) {
        return 'Global';
    }

    if (dataset.spatial) {
        const fromGeoJson = geoJsonToSpatialCoverage(dataset.spatial);
        if (fromGeoJson) {
            return fromGeoJson;
        }
    }

    if (spatialType === 'derived_from_resources' && dataset.resources?.length) {
        const bounds = initBounds();
        let hasBounds = false;
        for (const resource of dataset.resources) {
            const resourceBounds = boundsFromGeometry(
                resource.spatial_geom?.geometry ?? resource.spatial_geom
            );
            if (!resourceBounds) {
                continue;
            }
            hasBounds = true;
            extendBounds(bounds, resourceBounds.minLon, resourceBounds.minLat);
            extendBounds(bounds, resourceBounds.maxLon, resourceBounds.maxLat);
        }
        if (hasBounds) {
            return {
                '@type': 'Place',
                geo: boundsToGeoShape(bounds),
            };
        }
    }

    if (spatialAddress) {
        return {
            '@type': 'Place',
            name: spatialAddress,
        };
    }

    return undefined;
}

function resourceEncodingFormat(resource: Resource): string | undefined {
    const format = resource.format?.trim();
    if (format) {
        return format.toUpperCase() === format ? format : format.toUpperCase();
    }
    return resource.mimetype?.trim() || undefined;
}

export function buildDistribution(
    resources: Resource[] | undefined,
    ckanBaseUrl?: string
): DatasetJsonLdOutput['distribution'] {
    if (!resources?.length) {
        return undefined;
    }

    const distribution = resources
        .filter((resource) => resource.state !== 'inactive' && resource.state !== 'deleted')
        .filter((resource) => resource.not_downloadable !== true)
        .filter((resource) => resource.type !== 'empty')
        .map((resource) => {
            let contentUrl = resource.url;
            if (!isHttpUrl(contentUrl) && ckanBaseUrl && resource.id) {
                contentUrl = `${ckanBaseUrl.replace(/\/$/, '')}/dataset/resource/${resource.id}`;
            }
            if (!isHttpUrl(contentUrl)) {
                return null;
            }
            const entry: NonNullable<DatasetJsonLdOutput['distribution']>[number] = {
                '@type': 'DataDownload',
                contentUrl,
            };
            const encodingFormat = resourceEncodingFormat(resource);
            if (encodingFormat) {
                entry.encodingFormat = encodingFormat;
            }
            const name = resource.title?.trim() || resource.name?.trim();
            if (name) {
                entry.name = name;
            }
            return entry;
        })
        .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

    return distribution.length ? distribution : undefined;
}

function buildCreator(dataset: WriDataset): DatasetJsonLdOutput['creator'] {
    if (dataset.organization?.title || dataset.organization?.name) {
        return {
            '@type': 'Organization',
            name: dataset.organization.title ?? dataset.organization.name,
        };
    }

    const authors = dataset.authors?.filter((author) => author.name?.trim());
    if (!authors?.length) {
        return undefined;
    }

    return authors.map((author) => ({
        '@type': 'Person',
        name: author.name,
    }));
}

export function buildDatasetJsonLd(
    dataset: WriDataset,
    pageUrl: string,
    options?: { catalogName?: string; catalogUrl?: string; ckanBaseUrl?: string }
): DatasetJsonLdOutput {
    const description = dataset.short_description?.trim();
    const name = (dataset.title ?? dataset.name).trim();
    const licenseUrl = dataset.license_url;

    const output: DatasetJsonLdOutput = {
        name,
        description: description || name,
        url: pageUrl,
    };

    if (isHttpUrl(licenseUrl)) {
        output.license = licenseUrl;
    }

    const keywords = dataset.tags
        ?.map((tag) => tag.name?.trim())
        .filter((tag): tag is string => !!tag);
    if (keywords?.length) {
        output.keywords = keywords;
    }

    const temporalCoverage = formatTemporalCoverage(
        dataset.temporal_coverage_start,
        dataset.temporal_coverage_end
    );
    if (temporalCoverage) {
        output.temporalCoverage = temporalCoverage;
    }

    const spatialCoverage = buildSpatialCoverage(dataset);
    if (spatialCoverage) {
        output.spatialCoverage = spatialCoverage;
    }

    const distribution = buildDistribution(dataset.resources, options?.ckanBaseUrl);
    if (distribution) {
        output.distribution = distribution;
    }

    const creator = buildCreator(dataset);
    if (creator) {
        output.creator = creator;
    }

    if (typeof dataset.isopen === 'boolean') {
        output.isAccessibleForFree = dataset.isopen;
    }

    if (dataset.metadata_modified) {
        output.dateModified = dataset.metadata_modified;
    }

    if (options?.catalogUrl) {
        output.includedInDataCatalog = {
            '@type': 'DataCatalog',
            name: options.catalogName ?? 'WRI Data Explorer',
            url: options.catalogUrl,
        };
    }

    return output;
}
