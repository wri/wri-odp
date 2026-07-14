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

/** Minimal resource fields needed for Dataset JSON-LD (avoids strict Resource.layerObj*). */
export type DatasetJsonLdResource = {
    id?: string;
    name?: string | null;
    title?: string | null;
    format?: string | null;
    mimetype?: string | null;
    url?: string | null;
    state?: string | null;
    type?: string | null;
    not_downloadable?: boolean | null;
    spatial_geom?: GeoJsonGeometry | { geometry?: GeoJsonGeometry } | null;
};

/** Minimal dataset fields needed for Dataset JSON-LD. */
export type DatasetJsonLdInput = {
    name: string;
    title?: string | null;
    short_description?: string | null;
    notes?: string | null;
    cautions?: string | null;
    license_url?: string | null;
    license_title?: string | null;
    citation?: string | null;
    technical_notes?: string | null;
    methodology?: string | null;
    url?: string | null;
    tags?: Array<{ name?: string; display_name?: string }> | null;
    groups?: Array<{
        type?: string;
        name?: string;
        title?: string;
        display_name?: string;
    }> | null;
    temporal_coverage_start?: string | number | null;
    temporal_coverage_end?: string | number | null;
    spatial_type?: string | null;
    spatial_address?: string | null;
    spatial?: GeoJson | null;
    resources?: DatasetJsonLdResource[] | null;
    organization?: {
        title?: string | null;
        name?: string | null;
    } | null;
    authors?: Array<{ name?: string | null }> | null;
    isopen?: boolean;
    metadata_modified?: string | null;
};

export type DatasetJsonLdLicense =
    | string
    | {
          '@type': 'CreativeWork';
          name: string;
          url?: string;
      };

export type DatasetJsonLdOutput = {
    name: string;
    description: string;
    url?: string;
    license?: DatasetJsonLdLicense;
    keywords?: string[];
    citation?: string;
    identifier?: string | string[];
    sameAs?: string | string[];
    measurementTechnique?: string;
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

const MAX_DESCRIPTION_LENGTH = 5000;

type Bounds = {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
};

function isHttpUrl(value: string | undefined): value is string {
    return !!value && /^https?:\/\//i.test(value);
}

const HTML_ENTITY_MAP: Record<string, string> = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' ',
};

export function stripHtmlToText(value: string | null | undefined): string {
    if (!value) {
        return '';
    }

    return value
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/(p|div|h[1-6]|tr|table|section|article)>/gi, '\n\n')
        .replace(/<\/(li|dt)>/gi, '\n')
        .replace(/<(li|dt)[^>]*>/gi, '- ')
        .replace(/<[^>]+>/g, '')
        .replace(/&([a-z]+);/gi, (_, entity: string) => {
            return HTML_ENTITY_MAP[entity.toLowerCase()] ?? '';
        })
        .replace(/&#(\d+);/g, (_, code: string) => {
            return String.fromCharCode(Number(code));
        })
        .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => {
            return String.fromCharCode(parseInt(code, 16));
        })
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]{2,}/g, ' ')
        // Drop any leftover angle brackets after tag stripping (e.g. broken markup).
        .replace(/[<>]/g, '')
        .trim();
}

export function buildDescription(dataset: {
    notes?: string | null;
    short_description?: string | null;
    cautions?: string | null;
}): string {
    const about = stripHtmlToText(dataset.notes);
    const shortDescription = dataset.short_description?.trim() ?? '';
    const cautions = stripHtmlToText(dataset.cautions);

    const parts: string[] = [];
    if (about.length >= 50) {
        parts.push(about);
    } else if (shortDescription) {
        parts.push(shortDescription);
    } else if (about) {
        parts.push(about);
    }

    if (cautions) {
        parts.push(`Cautions:\n${cautions}`);
    }

    const description = parts.join('\n\n').trim();
    if (!description) {
        return '';
    }

    if (description.length <= MAX_DESCRIPTION_LENGTH) {
        return description;
    }
    return `${description.slice(0, MAX_DESCRIPTION_LENGTH - 1).trimEnd()}…`;
}

export function buildKeywords(dataset: {
    tags?: Array<{ name?: string; display_name?: string }> | null;
    groups?: Array<{
        type?: string;
        name?: string;
        title?: string;
        display_name?: string;
    }> | null;
}): string[] | undefined {
    const keywords = new Set<string>();

    for (const tag of dataset.tags ?? []) {
        const name = (tag.display_name ?? tag.name)?.trim();
        if (name) {
            keywords.add(name);
        }
    }

    for (const group of dataset.groups ?? []) {
        if (group.type !== 'group' && group.type !== 'application') {
            continue;
        }
        const name = (group.display_name ?? group.title ?? group.name)?.trim();
        if (name) {
            keywords.add(name);
        }
    }

    return keywords.size ? Array.from(keywords) : undefined;
}

export function buildLicense(
    dataset: {
        license_url?: string | null;
        license_title?: string | null;
    }
): DatasetJsonLdLicense | undefined {
    const licenseUrl = dataset.license_url?.trim();
    const licenseTitle = dataset.license_title?.trim();

    if (isHttpUrl(licenseUrl) && licenseTitle) {
        return {
            '@type': 'CreativeWork',
            name: licenseTitle,
            url: licenseUrl,
        };
    }
    if (isHttpUrl(licenseUrl)) {
        return licenseUrl;
    }
    if (licenseTitle) {
        return {
            '@type': 'CreativeWork',
            name: licenseTitle,
        };
    }
    return undefined;
}

function uniqueHttpUrls(...values: Array<string | null | undefined>): string[] {
    const urls = new Set<string>();
    for (const value of values) {
        const trimmed = value?.trim();
        if (isHttpUrl(trimmed)) {
            urls.add(trimmed);
        }
    }
    return Array.from(urls);
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

    const bounds = boundsFromGeometry(geoJson);
    if (!bounds) {
        return undefined;
    }
    return {
        '@type': 'Place',
        geo: boundsToGeoShape(bounds),
    };
}

export function buildSpatialCoverage(dataset: {
    spatial_type?: string | null;
    spatial_address?: string | null;
    spatial?: GeoJson | null;
    resources?: DatasetJsonLdResource[] | null;
}): string | Record<string, unknown> | undefined {
    const spatialType = dataset.spatial_type ?? undefined;
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
            const geom = resource.spatial_geom;
            const geometry =
                geom && typeof geom === 'object' && 'geometry' in geom
                    ? geom.geometry
                    : (geom as GeoJsonGeometry | null | undefined);
            const resourceBounds = boundsFromGeometry(geometry ?? undefined);
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

function resourceEncodingFormat(
    resource: DatasetJsonLdResource
): string | undefined {
    const format = resource.format?.trim();
    if (format) {
        return format.toUpperCase() === format ? format : format.toUpperCase();
    }
    return resource.mimetype?.trim() || undefined;
}

export function buildDistribution(
    resources: DatasetJsonLdResource[] | null | undefined,
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
            let contentUrl = resource.url ?? undefined;
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

function buildCreator(
    dataset: DatasetJsonLdInput
): DatasetJsonLdOutput['creator'] {
    const organizationName =
        dataset.organization?.title?.trim() ||
        dataset.organization?.name?.trim();
    if (organizationName) {
        return {
            '@type': 'Organization',
            name: organizationName,
        };
    }

    const authors = dataset.authors
        ?.map((author) => author.name?.trim())
        .filter((name): name is string => !!name);
    if (!authors?.length) {
        return undefined;
    }

    return authors.map((name) => ({
        '@type': 'Person',
        name,
    }));
}

export function buildDatasetJsonLd(
    dataset: DatasetJsonLdInput,
    pageUrl: string,
    options?: { catalogName?: string; catalogUrl?: string; ckanBaseUrl?: string }
): DatasetJsonLdOutput {
    const name = dataset.title?.trim() || dataset.name.trim();
    const description = buildDescription(dataset) || name;

    const output: DatasetJsonLdOutput = {
        name,
        description,
        url: pageUrl,
    };

    const license = buildLicense(dataset);
    if (license) {
        output.license = license;
    }

    const keywords = buildKeywords(dataset);
    if (keywords?.length) {
        output.keywords = keywords;
    }

    const citation = dataset.citation?.trim();
    if (citation) {
        output.citation = citation;
    }

    const identifiers = uniqueHttpUrls(dataset.technical_notes);
    if (identifiers.length === 1) {
        output.identifier = identifiers[0];
    } else if (identifiers.length > 1) {
        output.identifier = identifiers;
    }

    const sameAs = uniqueHttpUrls(dataset.url).filter((url) => url !== pageUrl);
    if (sameAs.length === 1) {
        output.sameAs = sameAs[0];
    } else if (sameAs.length > 1) {
        output.sameAs = sameAs;
    }

    const methodology = stripHtmlToText(dataset.methodology);
    if (methodology) {
        output.measurementTechnique =
            methodology.length > 500
                ? `${methodology.slice(0, 499).trimEnd()}…`
                : methodology;
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
