import { describe, expect, it } from 'vitest';
import {
    buildDatasetJsonLd,
    buildDescription,
    buildDistribution,
    buildKeywords,
    buildLicense,
    buildSpatialCoverage,
    formatTemporalCoverage,
    htmlToMarkdown,
    stripHtmlToText,
    type DatasetJsonLdInput,
} from '@/utils/datasetJsonLd';

const baseDataset: DatasetJsonLdInput = {
    name: 'test-dataset',
    title: 'Test Dataset',
    short_description: 'A short description of the dataset.',
    temporal_coverage_start: '2001',
    temporal_coverage_end: '2023',
    resources: [],
    license_url: 'http://www.opendefinition.org/licenses/cc-by',
    license_title: 'Creative Commons Attribution',
    isopen: true,
    metadata_modified: '2025-05-22T13:42:04.673439',
    spatial_type: 'address',
    spatial_address: 'Global',
    tags: [{ name: 'forests' }],
    organization: {
        name: 'land-carbon-lab',
        title: 'Land & Carbon Lab',
    },
};

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

    it('removes leftover angle brackets from broken markup', () => {
        expect(stripHtmlToText('Before <script After')).toBe(
            'Before script After'
        );
    });

    it('does not reintroduce tags via nested markup or entities', () => {
        const nested = stripHtmlToText('<scr<script>ipt>alert(1)</script>');
        expect(nested).not.toMatch(/[<>]/);
        expect(nested).toContain('alert(1)');
        expect(stripHtmlToText('A &lt;script&gt; B')).toBe('A script B');
    });
});

describe('htmlToMarkdown', () => {
    it('keeps unordered and ordered lists as Markdown', () => {
        expect(
            htmlToMarkdown(
                '<p>Intro</p><ul><li><p>Capping the maximum number of images per year at 12</p></li><li><p>Improving Sentinel-2 imagery selection</p></li></ul>'
            )
        ).toBe(
            'Intro\n\n- Capping the maximum number of images per year at 12\n- Improving Sentinel-2 imagery selection'
        );

        expect(
            htmlToMarkdown('<ol><li>First step</li><li>Second step</li></ol>')
        ).toBe('1. First step\n2. Second step');
    });

    it('indents nested lists and keeps absolute links', () => {
        expect(
            htmlToMarkdown(
                '<ul><li>Parent<ul><li>Child</li></ul></li></ul><p>See <a href="https://example.com/notes">the note</a>.</p>'
            )
        ).toBe(
            '- Parent\n  - Child\n\nSee [the note](https://example.com/notes).'
        );
    });

    it('indents nested lists to the parent ordered-list marker width', () => {
        expect(
            htmlToMarkdown('<ol><li>Parent<ul><li>Child</li></ul></li></ol>')
        ).toBe('1. Parent\n   - Child');

        const earlierItems = Array.from(
            { length: 9 },
            (_, index) => `<li>Item ${index + 1}</li>`
        ).join('');
        expect(
            htmlToMarkdown(
                `<ol>${earlierItems}<li>Item 10<ul><li>Nested</li></ul></li></ol>`
            )
        ).toContain('10. Item 10\n    - Nested');
    });

    it('drops non-http links and leftover markup', () => {
        expect(
            htmlToMarkdown(
                '<p>Before <a href="javascript:alert(1)">click</a> <scr<script>ipt>alert(1)</script></p>'
            )
        ).not.toMatch(/[<>]/);
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

    it('includes the full methodology with a Methodology heading and Markdown bullets', () => {
        const methodologyBody =
            'Capping the maximum number of images per year at 12 to reduce data throughput requirements. '.repeat(
                12
            );
        const description = buildDescription({
            notes: '<p>The tropical tree cover data maps tree extent at the ten-meter scale and tree cover at the half hectare scale to enable accurate monitoring.</p>',
            methodology: `<ul><li><p>${methodologyBody}</p></li><li><p>Improving Sentinel-2 imagery selection across the time series.</p></li></ul>`,
            cautions: '<p>Different tree definition than Hansen.</p>',
        });

        expect(description).toContain('Methodology\n\n- ');
        expect(description).toContain(methodologyBody.trim());
        expect(description).toContain(
            '- Improving Sentinel-2 imagery selection across the time series.'
        );
        expect(description).not.toMatch(/…/);
        expect(description).toContain('Cautions:');
    });

    it('keeps methodology intact when the combined text exceeds 5000 characters', () => {
        const methodology = 'Method detail. '.repeat(80).trim();
        const description = buildDescription({
            notes: `<p>${'About the dataset. '.repeat(300)}</p>`,
            methodology: `<p>${methodology}</p>`,
            cautions: `<p>${'Use with care. '.repeat(80)}</p>`,
        });

        expect(description.length).toBeLessThanOrEqual(5000);
        expect(description).toContain(`Methodology\n\n${methodology}`);
        expect(description.endsWith(methodology)).toBe(true);
    });

    it('drops a Markdown link instead of cutting it off', () => {
        const url = 'https://example.com/very-long-methodology-document';
        const prefix = `${'x'.repeat(4978)} `;
        const description = buildDescription({
            notes: `<p>${prefix}<a href="${url}">note</a> after the link</p>`,
        });

        expect(description.length).toBeLessThanOrEqual(5000);
        expect(description.endsWith('…')).toBe(true);
        expect(description).not.toContain(url);
        expect(description).not.toContain('[note]');
        expect(description.replace(/…$/, '')).not.toMatch(/\[|\]\(/);
    });

    it('keeps a Markdown link that fits before the character limit', () => {
        const description = buildDescription({
            notes: `<p>${'About the dataset. '.repeat(20)}<a href="https://example.com/notes">note</a> ${'More detail. '.repeat(400)}</p>`,
        });

        expect(description.length).toBeLessThanOrEqual(5000);
        expect(description).toContain('[note](https://example.com/notes)');
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
                imageUrl: 'https://datasets.wri.org/images/WRI_logo_thumbnail.png',
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
            image: 'https://datasets.wri.org/images/WRI_logo_thumbnail.png',
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
        expect(jsonLd.description).toContain(
            'Methodology\n\nMulti-temporal convolutional neural network models applied to Sentinel imagery.'
        );
        expect(jsonLd).not.toHaveProperty('measurementTechnique');
    });

    it('falls back to name when title is blank', () => {
        const jsonLd = buildDatasetJsonLd(
            {
                ...baseDataset,
                title: '   ',
            },
            'https://datasets.wri.org/datasets/test-dataset'
        );

        expect(jsonLd.name).toBe('test-dataset');
    });

    it('trims organization and author creator names', () => {
        expect(
            buildDatasetJsonLd(
                {
                    ...baseDataset,
                    organization: {
                        ...baseDataset.organization,
                        title: '  Land & Carbon Lab  ',
                    },
                },
                'https://datasets.wri.org/datasets/test-dataset'
            ).creator
        ).toEqual({
            '@type': 'Organization',
            name: 'Land & Carbon Lab',
        });

        expect(
            buildDatasetJsonLd(
                {
                    ...baseDataset,
                    organization: undefined,
                    authors: [{ name: '  Jane Doe  ' }],
                },
                'https://datasets.wri.org/datasets/test-dataset'
            ).creator
        ).toEqual([
            {
                '@type': 'Person',
                name: 'Jane Doe',
            },
        ]);
    });
});
