export const temperature = {
    name: 'Urban Daytime Temperature Difference from Surrounding Area (°C)',
    slug: 'Urban-Daytime-Temperature-Difference-from-Surrounding-Area-degreeC_4',
    description:
        'The difference in average summer daytime maximum land surface temperatures between urban areas and surrounding 10-kilometer buffers for the year 2013.',
    application: ['data-explorer'],
    iso: [],
    provider: 'cartodb',
    type: 'layer',
    thumbnailUrl:
        'https://s3.amazonaws.com/wri-api-backups/resourcewatch/prod/thumbnails/eb22d3f8-343c-4981-ab11-f0c2e091896a-1644338760798.png',
    layerConfig: {
        account: 'wri-rw',
        type: "vector",
        source: {
            type: 'vector',
            provider: {
                type: 'carto',
                account: 'wri-rw',
                layers: [
                    {
                        options: {
                            sql: 'SELECT * FROM cit_015_urban_heat_island_effect',
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
                        'fill-color': [
                            'interpolate-lab',
                            ['linear'],
                            ['to-number', ['get', 'd_t_diff']],
                            -3,
                            '#3288bd',
                            -2,
                            '#66c2a5',
                            -1,
                            '#abdda4',
                            0,
                            '#ffffbf',
                            1,
                            '#fdae61',
                            2,
                            '#f46d43',
                            3,
                            '#d53e4f',
                        ],
                        'fill-opacity': 1,
                    },
                    'source-layer': 'layer0',
                    type: 'fill',
                    filter: ['all'],
                },
                {
                    paint: {
                        'line-width': 0.5,
                        'line-color': [
                            'interpolate-lab',
                            ['linear'],
                            ['to-number', ['get', 'd_t_diff']],
                            -3,
                            '#3288bd',
                            -2,
                            '#66c2a5',
                            -1,
                            '#abdda4',
                            0,
                            '#ffffbf',
                            1,
                            '#fdae61',
                            2,
                            '#f46d43',
                            3,
                            '#d53e4f',
                        ],
                        'line-opacity': 0.5,
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
                color: '#3288bd',
                name: '< -3',
                id: 0,
            },
            {
                color: '#66c2a5',
                name: '< -2',
                id: 1,
            },
            {
                color: '#abdda4',
                name: '< -1',
                id: 2,
            },
            {
                color: '#e6f598',
                name: '< -0.25',
                id: 3,
            },
            {
                color: '#ffffbf',
                name: '± 0.25',
                id: 4,
            },
            {
                color: '#fee08b',
                name: '> 0.25',
                id: 5,
            },
            {
                color: '#fdae61',
                name: '> 1',
                id: 6,
            },
            {
                color: '#f46d43',
                name: '> 2',
                id: 7,
            },
            {
                color: '#d53e4f',
                name: '> 3',
                id: 8,
            },
        ],
        type: 'choropleth',
    },
    interactionConfig: {
        output: [
            {
                column: 'name',
                format: null,
                prefix: '',
                property: 'City',
                suffix: '',
                type: 'string',
                enabled: true,
            },
            {
                column: 'sqkm_final',
                format: '0,0',
                prefix: '',
                property: 'Area',
                suffix: ' km²',
                type: 'number',
                enabled: true,
            },
            {
                column: 'd_t_diff',
                format: '0a',
                prefix: '',
                property: 'Daytime Temperature Difference',
                suffix: '°C',
                type: 'number',
                enabled: true,
            },
        ],
    },
    applicationConfig: {},
    staticImageConfig: {},
}
