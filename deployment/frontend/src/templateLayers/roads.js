export const roads = {
    name: 'Roads',
    id: '1baa17a0-51bb-4d97-8876-4980013e81de',
    slug: 'Roads_4',
    dataset: '5fe43cd9-0210-4a6f-86ba-d8a7b91a180d',
    description:
        'The best available roads data by country, compiled from various data sets gathered between 1980 and 2010.',
    application: ['rw', 'crt'],
    iso: [],
    provider: 'cartodb',
    type: 'layer',
    userId: '5ba001878e311b7e3718740f',
    default: true,
    protected: false,
    published: true,
    thumbnailUrl:
        'https://s3.amazonaws.com/wri-api-backups/resourcewatch/prod/thumbnails/1baa17a0-51bb-4d97-8876-4980013e81de-1659074506951.png',
    env: 'production',
    layerConfig: {
        account: 'wri-rw',
        body: {
            maxzoom: 18,
            layers: [
                {
                    type: 'mapnik',
                    options: {
                        sql: 'SELECT * FROM cit_016_road_network',
                        cartocss:
                            '#layer {line-color: #d95f0e; line-width: 0.5; line-opacity: 1;}',
                        cartocss_version: '2.3.0',
                    },
                },
            ],
            vectorLayers: [
                {
                    paint: {
                        'line-color': ' #d95f0e',
                        'line-width': 0.5,
                        'line-opacity': 1,
                    },
                    'source-layer': 'layer0',
                    type: 'line',
                    filter: ['all'],
                },
            ],
        },
        layerType: 'vector',
        type: 'vector',
        lmMetadata: {
            version: '4.0',
            'legacy-keys': ['account', 'layerType', 'body'],
        },
        source: {
            type: 'vector',
            provider: {
                type: 'carto',
                account: 'wri-rw',
                layers: [
                    {
                        options: {
                            sql: 'SELECT * FROM cit_016_road_network',
                            type: 'cartodb',
                        },
                    },
                ],
            },
        },
        render: {
            layers: [
                {
                    paint: {
                        'line-color': ' #d95f0e',
                        'line-width': 0.5,
                        'line-opacity': 1,
                    },
                    'source-layer': 'layer0',
                    type: 'line',
                    filter: ['all'],
                },
            ],
        },
    },
    legendConfig: {
        items: [
            {
                color: '#d95f0e',
                name: 'Roads',
                id: 0,
            },
        ],
        type: 'basic',
    },
    interactionConfig: {
        output: [
            {
                column: 'length_km',
                format: '0,0',
                prefix: '',
                property: 'Length',
                suffix: ' km',
                type: 'number',
                enabled: true,
            },
            {
                column: 'onme',
                format: null,
                prefix: '',
                property: 'Official Road Name',
                suffix: '',
                type: 'string',
                enabled: true,
            },
        ],
    },
    applicationConfig: {
        crt: {
            timescale: 'historic',
        },
    },
    staticImageConfig: {},
    createdAt: '2019-10-23T16:09:22.150Z',
    updatedAt: '2022-07-29T06:01:46.887Z',
}
