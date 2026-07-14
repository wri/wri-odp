import { describe, expect, it } from 'vitest';
import {
    buildDatasetJsonLd,
    buildDescription,
    buildDistribution,
    buildKeywords,
    buildLicense,
    buildSpatialCoverage,
    formatTemporalCoverage,
    stripHtmlToText,
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

describe('stripHtmlToText', () => {
    it('strips tags and keeps readable text', () => {
        expect(
            stripHtmlToText(
                '<p>Overview of trees.</p><ul><li>Caution one</li><li>Caution two</li></ul>'
            )
        ).toBe('Overview of trees.\n\n- Caution one\n- Caution two');
    });
});

describe('buildDescription', () => {
    it('prefers About notes over short description', () => {
        expect(
            buildDescription({
                short_description: 'Short blurb.',
                notes: '<p>The tropical tree cover data maps tree extent at the ten-meter scale and tree cover at the half hectare scale to enable accurate monitoring.</p>',
            })
        ).toContain('tropical tree cover data maps tree extent');
    });

    it('appends cautions when present', () => {
        const description = buildDescription({
            short_description:
                'This layer displays tree extent at the ten-meter scale for monitoring.',
            cautions: '<p>Different tree definition than Hansen.</p>',
        });
        expect(description).toContain('Cautions:');
        expect(description).toContain('Different tree definition than Hansen.');
    });

    it('falls back to short description when notes are too short', () => {
        expect(
            buildDescription({
                notes: '<p>Short</p>',
                short_description:
                    'This layer displays tree extent at the ten-meter scale for monitoring.',
            })
        ).toBe(
            'This layer displays tree extent at the ten-meter scale for monitoring.'
        );
    });
});

describe('buildKeywords', () => {
    it('merges tags, topics, and applications', () => {
        expect(
            buildKeywords({
                tags: [
                    { name: 'Tree Cover', display_name: 'Tree Cover' },
                    { name: 'forests' },
                ],
                groups: [
                    {
                        type: 'group',
                        name: 'land',
                        title: 'Land',
                        display_name: 'Land',
                    },
                    {
                        type: 'application',
                        name: 'gfw',
                        title: 'Global Forest Watch',
                        display_name: 'Global Forest Watch',
                    },
                ],
            })
        ).toEqual([
            'Tree Cover',
            'forests',
            'Land',
            'Global Forest Watch',
        ]);
    });
});

describe('buildLicense', () => {
    it('returns CreativeWork when title and url are present', () => {
        expect(
            buildLicense({
                license_title: 'Open Data Commons Attribution License',
                license_url: 'http://www.opendefinition.org/licenses/odc-by',
            })
        ).toEqual({
            '@type': 'CreativeWork',
            name: 'Open Data Commons Attribution License',
            url: 'http://www.opendefinition.org/licenses/odc-by',
        });
    });

    it('falls back to title-only CreativeWork', () => {
        expect(
            buildLicense({
                license_title: 'Custom Internal License',
                license_url: null,
            })
        ).toEqual({
            '@type': 'CreativeWork',
            name: 'Custom Internal License',
        });
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
    it('builds a Google Dataset Search-friendly payload from About fields', () => {
        const jsonLd = buildDatasetJsonLd(
            {
                ...baseDataset,
                notes: '<p>The tropical tree cover data maps tree extent at the ten-meter scale and tree cover at the half hectare scale to enable accurate monitoring of trees.</p>',
                citation:
                    'Brandt, J., et al. (2023). Wall-to-wall mapping of tree extent. https://doi.org/10.1016/j.rse.2023.113574',
                technical_notes: 'https://doi.org/10.1016/j.rse.2023.113574',
                methodology:
                    '<p>Multi-temporal convolutional neural network models applied to Sentinel imagery.</p>',
                cautions: '<p>Different tree definition than Hansen et al.</p>',
                url: 'https://data.globalforestwatch.org/datasets/gfw::tropical-tree-cover',
                groups: [
                    {
                        id: 'g1',
                        name: 'land',
                        title: 'Land',
                        display_name: 'Land',
                        type: 'group',
                        description: '',
                        image_display_url: '',
                        image_url: '',
                        package_count: 1,
                        created: '',
                        is_organization: false,
                        state: 'active',
                        revision_id: '',
                        num_followers: 0,
                        approval_status: 'approved',
                    },
                    {
                        id: 'a1',
                        name: 'gfw',
                        title: 'Global Forest Watch',
                        display_name: 'Global Forest Watch',
                        type: 'application',
                        description: '',
                        image_display_url: '',
                        image_url: '',
                        package_count: 1,
                        created: '',
                        is_organization: false,
                        state: 'active',
                        revision_id: '',
                        num_followers: 0,
                        approval_status: 'approved',
                    },
                ],
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
            url: 'https://datasets.wri.org/datasets/test-dataset',
            license: {
                '@type': 'CreativeWork',
                name: 'Creative Commons Attribution',
                url: 'http://www.opendefinition.org/licenses/cc-by',
            },
            keywords: ['forests', 'Land', 'Global Forest Watch'],
            citation:
                'Brandt, J., et al. (2023). Wall-to-wall mapping of tree extent. https://doi.org/10.1016/j.rse.2023.113574',
            identifier: 'https://doi.org/10.1016/j.rse.2023.113574',
            sameAs:
                'https://data.globalforestwatch.org/datasets/gfw::tropical-tree-cover',
            measurementTechnique:
                'Multi-temporal convolutional neural network models applied to Sentinel imagery.',
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
        expect(jsonLd.description).toContain(
            'tropical tree cover data maps tree extent'
        );
        expect(jsonLd.description).toContain('Cautions:');
        expect(jsonLd.description).toContain(
            'Different tree definition than Hansen et al.'
        );
    });
});
