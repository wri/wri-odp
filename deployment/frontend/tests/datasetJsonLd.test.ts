import { describe, expect, it } from 'vitest';
import {
    buildDatasetJsonLd,
    buildDistribution,
    buildSpatialCoverage,
    formatTemporalCoverage,
} from '@/utils/datasetJsonLd';
import { type WriDataset } from '@/schema/ckan.schema';

const baseDataset = {
    id: 'test-id',
    name: 'test-dataset',
    title: 'Test Dataset',
    short_description: 'A short description of the dataset.',
    creator_user_id: 'user-1',
    temporal_coverage_start: '2001',
    temporal_coverage_end: '2023',
    update_frequency: 'annually' as const,
    visibility_type: 'public' as const,
    release_notes: '',
    resources: [],
    license_url: 'http://www.opendefinition.org/licenses/cc-by',
    license_id: 'cc-by',
    license_title: 'Creative Commons Attribution',
    isopen: true,
    metadata_modified: '2025-05-22T13:42:04.673439',
    spatial_type: 'address',
    spatial_address: 'Global',
    tags: [{ id: '1', name: 'forests', state: 'active' as const }],
    organization: {
        id: 'org-1',
        name: 'land-carbon-lab',
        title: 'Land & Carbon Lab',
        is_organization: true,
        state: 'active' as const,
        visibility: 'public',
    },
} satisfies WriDataset;

describe('formatTemporalCoverage', () => {
    it('formats a closed interval', () => {
        expect(formatTemporalCoverage('2001', '2023')).toBe('2001/2023');
    });

    it('formats an open-ended interval', () => {
        expect(formatTemporalCoverage('2015', null)).toBe('2015/..');
        expect(formatTemporalCoverage(null, '2020')).toBe('../2020');
    });
});

describe('buildSpatialCoverage', () => {
    it('returns Global for global coverage', () => {
        expect(
            buildSpatialCoverage({
                spatial_type: 'global',
                spatial_address: 'Global',
            })
        ).toBe('Global');
    });

    it('returns a named place for address coverage', () => {
        expect(
            buildSpatialCoverage({
                spatial_type: 'address',
                spatial_address: 'Brazil, South America',
            })
        ).toEqual({
            '@type': 'Place',
            name: 'Brazil, South America',
        });
    });

    it('returns GeoShape for polygon geometry', () => {
        expect(
            buildSpatialCoverage({
                spatial_type: 'geom',
                spatial: {
                    type: 'Polygon',
                    coordinates: [
                        [
                            [-65, 18],
                            [-65, 72],
                            [172, 72],
                            [172, 18],
                            [-65, 18],
                        ],
                    ],
                },
            })
        ).toEqual({
            '@type': 'Place',
            geo: {
                '@type': 'GeoShape',
                box: '18 -65 72 172',
            },
        });
    });
});

describe('buildDistribution', () => {
    it('maps downloadable resources with stable URLs', () => {
        expect(
            buildDistribution([
                {
                    id: 'res-1',
                    title: 'CSV file',
                    format: 'CSV',
                    url: 'https://example.com/data.csv',
                    state: 'active',
                    type: 'upload',
                },
                {
                    id: 'res-2',
                    title: 'Internal layer',
                    format: 'Layer',
                    url: 'https://api.example.com/layer/1',
                    state: 'active',
                    type: 'layer-raw',
                },
                {
                    id: 'res-3',
                    title: 'Not downloadable',
                    format: 'PDF',
                    url: 'https://example.com/doc.pdf',
                    state: 'active',
                    type: 'link',
                    not_downloadable: true,
                },
            ])
        ).toEqual([
            {
                '@type': 'DataDownload',
                contentUrl: 'https://example.com/data.csv',
                encodingFormat: 'CSV',
                name: 'CSV file',
            },
            {
                '@type': 'DataDownload',
                contentUrl: 'https://api.example.com/layer/1',
                encodingFormat: 'LAYER',
                name: 'Internal layer',
            },
        ]);
    });
});

describe('buildDatasetJsonLd', () => {
    it('builds a Google Dataset Search-friendly payload', () => {
        const jsonLd = buildDatasetJsonLd(
            {
                ...baseDataset,
                resources: [
                    {
                        id: 'res-1',
                        title: 'Raster file',
                        format: 'tif',
                        url: 'https://example.com/file.tif',
                        state: 'active',
                        type: 'upload',
                    },
                ],
            },
            'https://datasets.wri.org/datasets/test-dataset',
            {
                catalogName: 'WRI Data Explorer',
                catalogUrl: 'https://datasets.wri.org',
            }
        );

        expect(jsonLd).toMatchObject({
            name: 'Test Dataset',
            description: 'A short description of the dataset.',
            url: 'https://datasets.wri.org/datasets/test-dataset',
            license: 'http://www.opendefinition.org/licenses/cc-by',
            keywords: ['forests'],
            temporalCoverage: '2001/2023',
            spatialCoverage: 'Global',
            isAccessibleForFree: true,
            dateModified: '2025-05-22T13:42:04.673439',
            creator: {
                '@type': 'Organization',
                name: 'Land & Carbon Lab',
            },
            includedInDataCatalog: {
                '@type': 'DataCatalog',
                name: 'WRI Data Explorer',
                url: 'https://datasets.wri.org',
            },
            distribution: [
                {
                    '@type': 'DataDownload',
                    contentUrl: 'https://example.com/file.tif',
                    encodingFormat: 'TIF',
                    name: 'Raster file',
                },
            ],
        });
    });
});
