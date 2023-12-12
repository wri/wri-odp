export const roads = {
    name: 'Roads',
    description:
        'The best available roads data by country, compiled from various data sets gathered between 1980 and 2010.',
    application: ['data-explorer'],
    iso: [],
    provider: 'cartodb',
    type: 'layer',
    thumbnailUrl:
        'https://s3.amazonaws.com/wri-api-backups/resourcewatch/prod/thumbnails/1baa17a0-51bb-4d97-8876-4980013e81de-1659074506951.png',
    layerConfig: {
        type: "vector",
        account: 'wri-rw',
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
