export const hdi = {
    id: 'a26606ad-3b16-4a4d-be7f-f2640a5c81e2',
    name: '2015 Human Development Index',
    slug: 'human-development-index',
    description:
        'A composite index measuring average achievement in 3 basic dimensions of human development: a long and healthy life, knowledge, and a decent standard of living. 2015 Index scores are displayed.',
    application: ['data-explorer'],
    iso: [],
    provider: 'cartodb',
    type: 'layer',
    thumbnailUrl:
        'https://s3.amazonaws.com/wri-api-backups/resourcewatch/prod/thumbnails/00b9c036-38ea-4ece-a00f-ca315e25e0e0-1643743980009.png',
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
                            sql: 'SELECT wri.cartodb_id, wri.the_geom_webmercator, data.rw_country_name, data.rw_country_code, data.datetime, data.yr_data FROM soc_004_human_development_index data LEFT OUTER JOIN wri_countries_a wri ON data.rw_country_code = wri.iso_a3 WHERE EXTRACT(YEAR FROM data.datetime) = 2015 and data.yr_data is not null',
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
                            'step',
                            ['to-number', ['get', 'yr_data']],
                            '#ffffcc',
                            0.5,
                            '#a1dab4',
                            0.7,
                            '#41b6c4',
                            0.75,
                            '#2c7fb8',
                            0.85,
                            '#253494',
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
                        'line-color': '#fff',
                        'line-opacity': 0.8,
                    },
                    'source-layer': 'layer0',
                    type: 'line',
                    filter: ['all'],
                },
            ],
        },
    },
    legendConfig: {
        type: 'choropleth',
        items: [
            {
                name: '<0.5',
                color: '#ffffcc',
                id: 0,
            },
            {
                name: '<0.7',
                color: '#a1dab4',
                id: 1,
            },
            {
                name: '<0.75',
                color: '#41b6c4',
                id: 2,
            },
            {
                name: '<0.85',
                color: '#2c7fb8',
                id: 3,
            },
            {
                name: '<0.95',
                color: '#253494',
                id: 4,
            },
        ],
    },
    interactionConfig: {
        output: [
            {
                column: 'rw_country_name',
                format: null,
                prefix: '',
                property: 'Country',
                suffix: '',
                type: 'string',
                enabled: true,
            },
            {
                column: 'yr_data',
                format: null,
                prefix: '',
                property: '2015 Human Development Index',
                suffix: '',
                type: 'number',
                enabled: true,
            },
        ],
    },
    applicationConfig: {},
    staticImageConfig: {},
    createdAt: '2017-09-14T15:23:56.703Z',
    updatedAt: '2021-12-22T17:50:46.360Z',
}
