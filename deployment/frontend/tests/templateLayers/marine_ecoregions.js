export const marine_ecoregions = {
    id: '2dd860af-21be-47c6-8e1d-0b8eb63bfa46',
    name: '2007 Marine Ecoregions of the World',
    slug: 'marine-ecoregions-words',
    dataset: '36803484-c413-49a9-abe2-2286ee99b624',
    description:
        "A biogeographic classification of the world's coasts and shelves in 2007.",
    application: ['rw'],
    iso: [],
    provider: 'cartodb',
    type: 'layer',
    userId: '58f63c81bd32c60206ed6b12',
    default: true,
    protected: false,
    published: true,
    thumbnailUrl:
        'https://s3.amazonaws.com/wri-api-backups/resourcewatch/prod/thumbnails/2dd860af-21be-47c6-8e1d-0b8eb63bfa46-1644347940829.png',
    env: 'production',
    layerConfig: {
        account: 'wri-rw',
        body: {
            maxzoom: 18,
            layers: [
                {
                    type: 'mapnik',
                    options: {
                        sql: 'SELECT * FROM bio_018_marine_ecoregions',
                        cartocss:
                            "#bio_018_marine_ecoregions {polygon-fill: transparent; polygon-opacity: 0.2; line-width: 0.5;  line-opacity: 1;  [lat_zone='Tropical']{ polygon-fill: #30c2df; line-color:#30c2df;} [lat_zone='Temperate']{ polygon-fill: #0570b0; line-color:#0570b0;} [lat_zone='Polar']{ polygon-fill: #beefee; line-color:#beefee;}}",
                        cartocss_version: '2.3.0',
                    },
                },
            ],
            vectorLayers: [
                {
                    paint: {
                        'line-width': 0.5,
                        'line-opacity': 1,
                        'line-color': '#30c2df',
                    },
                    'source-layer': 'layer0',
                    type: 'line',
                    filter: ['all', ['==', 'lat_zone', 'Tropical']],
                },
                {
                    paint: {
                        'fill-color': ' #30c2df',
                        'fill-opacity': 0.2,
                    },
                    'source-layer': 'layer0',
                    type: 'fill',
                    filter: ['all', ['==', 'lat_zone', 'Tropical']],
                },
                {
                    paint: {
                        'line-color': '#0570b0',
                    },
                    'source-layer': 'layer0',
                    type: 'line',
                    filter: ['all', ['==', 'lat_zone', 'Temperate']],
                },
                {
                    paint: {
                        'fill-color': ' #0570b0',
                        'fill-opacity': 0.2,
                    },
                    'source-layer': 'layer0',
                    type: 'fill',
                    filter: ['all', ['==', 'lat_zone', 'Temperate']],
                },
                {
                    paint: {
                        'line-color': '#beefee',
                    },
                    'source-layer': 'layer0',
                    type: 'line',
                    filter: ['all', ['==', 'lat_zone', 'Polar']],
                },
                {
                    paint: {
                        'fill-color': '#beefee',
                        'fill-opacity': 0.2,
                    },
                    'source-layer': 'layer0',
                    type: 'fill',
                    filter: ['all', ['==', 'lat_zone', 'Polar']],
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
                            sql: 'SELECT * FROM bio_018_marine_ecoregions',
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
                        'line-width': 0.5,
                        'line-opacity': 1,
                        'line-color': '#30c2df',
                    },
                    'source-layer': 'layer0',
                    type: 'line',
                    filter: ['all', ['==', 'lat_zone', 'Tropical']],
                },
                {
                    paint: {
                        'fill-color': ' #30c2df',
                        'fill-opacity': 0.2,
                    },
                    'source-layer': 'layer0',
                    type: 'fill',
                    filter: ['all', ['==', 'lat_zone', 'Tropical']],
                },
                {
                    paint: {
                        'line-color': '#0570b0',
                    },
                    'source-layer': 'layer0',
                    type: 'line',
                    filter: ['all', ['==', 'lat_zone', 'Temperate']],
                },
                {
                    paint: {
                        'fill-color': ' #0570b0',
                        'fill-opacity': 0.2,
                    },
                    'source-layer': 'layer0',
                    type: 'fill',
                    filter: ['all', ['==', 'lat_zone', 'Temperate']],
                },
                {
                    paint: {
                        'line-color': '#beefee',
                    },
                    'source-layer': 'layer0',
                    type: 'line',
                    filter: ['all', ['==', 'lat_zone', 'Polar']],
                },
                {
                    paint: {
                        'fill-color': '#beefee',
                        'fill-opacity': 0.2,
                    },
                    'source-layer': 'layer0',
                    type: 'fill',
                    filter: ['all', ['==', 'lat_zone', 'Polar']],
                },
            ],
        },
    },
    legendConfig: {
        items: [
            {
                color: '#30c2df',
                name: 'Tropical',
                id: 0,
            },
            {
                color: '#0570b0',
                name: 'Temperate',
                id: 1,
            },
            {
                color: '#beefee',
                name: 'Polar',
                id: 2,
            },
        ],
        type: 'basic',
    },
    interactionConfig: {
        output: [
            {
                column: 'ecoregion',
                format: null,
                prefix: '',
                property: 'Ecoregion',
                suffix: '',
                type: 'string',
            },
            {
                column: 'province',
                format: null,
                prefix: '',
                property: 'Province',
                suffix: '',
                type: 'string',
            },
            {
                column: 'realm',
                format: null,
                prefix: '',
                property: 'Realm',
                suffix: '',
                type: 'string',
            },
            {
                column: 'cartodb_id',
                format: null,
                prefix: '',
                property: 'Area ID',
                suffix: '',
                type: 'number',
            },
        ],
    },
    applicationConfig: {},
    staticImageConfig: {},
    createdAt: '2017-08-21T20:38:57.963Z',
    updatedAt: '2022-02-08T19:19:00.739Z',
}
