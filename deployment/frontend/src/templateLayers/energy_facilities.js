export const energy_facilities = {
    id: '8905878f-8888-42a1-95b5-801fd0b529a8',
    name: '2016 Energy Facility Emissions ( MT CO₂e, thousands)',
    slug: '2016-Energy-Facility-Emissions-MT-COe-thousands',
    dataset: 'f61e9516-ae23-4870-b26b-4d1b57ac3225',
    description:
        'Greenhouse gas emissions data for large emitters, facilities that inject CO₂ underground, and suppliers in the United States for 2016. Emissions are measured in thousands of metric tons of carbon dioxide equivalent (MT CO₂e).',
    application: ['rw'],
    iso: [],
    provider: 'cartodb',
    type: 'layer',
    thumbnailUrl:
        'https://s3.amazonaws.com/wri-api-backups/resourcewatch/prod/thumbnails/2d3986c5-5483-4f65-98e0-b74b326dcd99-1644511745613.png',
    userId: '5fa99524458a470010d7dbf7',
    default: false,
    protected: false,
    published: true,
    env: 'production',
    layerConfig: {
        timeline: true,
        order: 2016,
        timelineLabel: '2016',
        account: 'wri-rw',
        body: {
            maxzoom: 18,
            layers: [
                {
                    type: 'mapnik',
                    options: {
                        sql: 'SELECT *, ghg_quantity_metric_tons_co2e AS ghg_fixed FROM ene_017_rw1_energy_facility_emissions_edit WHERE reporting_year = 2016',
                        cartocss:
                            '#ene_017_energy_facility_emissions_edit {marker-width:7; marker-fill-opacity: 1; marker-allow-overlap: true;} [ghg_fixed>=200000]{marker-fill:#a50f15;} [ghg_fixed>=80000][ghg_fixed<200000]{marker-fill:#de2d26;} [ghg_fixed>=40000][ghg_fixed<80000]{marker-fill:#fb6a4a;} [ghg_fixed>=20000][ghg_fixed<40000]{marker-fill:#fcae91;} [ghg_fixed>0][ghg_fixed<20000]{marker-fill:#fee5d9;} [ghg_fixed=0]{marker-fill:#808080}',
                        cartocss_version: '2.3.0',
                    },
                },
            ],
            vectorLayers: [
                {
                    paint: {
                        'circle-radius': 7,
                        'circle-opacity': 1,
                    },
                    'source-layer': 'layer0',
                    type: 'circle',
                    filter: ['all'],
                },
                {
                    paint: {
                        'circle-color': '#808080',
                    },
                    'source-layer': 'layer0',
                    type: 'circle',
                    filter: ['all', ['==', 'ghg_fixed', 0]],
                },
                {
                    paint: {
                        'circle-color': '#fee5d9',
                    },
                    'source-layer': 'layer0',
                    type: 'circle',
                    filter: [
                        'all',
                        ['>', 'ghg_fixed', 0],
                        ['<', 'ghg_fixed', 20000],
                    ],
                },
                {
                    paint: {
                        'circle-color': '#fcae91',
                    },
                    'source-layer': 'layer0',
                    type: 'circle',
                    filter: [
                        'all',
                        ['>=', 'ghg_fixed', 20000],
                        ['<', 'ghg_fixed', 40000],
                    ],
                },
                {
                    paint: {
                        'circle-color': '#fb6a4a',
                    },
                    'source-layer': 'layer0',
                    type: 'circle',
                    filter: [
                        'all',
                        ['>=', 'ghg_fixed', 40000],
                        ['<', 'ghg_fixed', 80000],
                    ],
                },
                {
                    paint: {
                        'circle-color': '#de2d26',
                    },
                    'source-layer': 'layer0',
                    type: 'circle',
                    filter: [
                        'all',
                        ['>=', 'ghg_fixed', 80000],
                        ['<', 'ghg_fixed', 200000],
                    ],
                },
                {
                    paint: {
                        'circle-color': '#a50f15',
                    },
                    'source-layer': 'layer0',
                    type: 'circle',
                    filter: ['all', ['>=', 'ghg_fixed', 200000]],
                },
            ],
        },
        layerType: 'vector',
        type: 'vector',
        lmMetadata: {
            version: '4.0',
            'legacy-keys': [
                'order',
                'timeline',
                'body',
                'layerType',
                'timelineLabel',
                'account',
            ],
        },
        source: {
            type: 'vector',
            provider: {
                type: 'carto',
                account: 'wri-rw',
                layers: [
                    {
                        options: {
                            sql: 'SELECT *, ghg_quantity_metric_tons_co2e AS ghg_fixed FROM ene_017_rw1_energy_facility_emissions_edit WHERE reporting_year = 2016',
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
                        'circle-radius': 7,
                        'circle-opacity': 1,
                    },
                    'source-layer': 'layer0',
                    type: 'circle',
                    filter: ['all'],
                },
                {
                    paint: {
                        'circle-color': '#808080',
                    },
                    'source-layer': 'layer0',
                    type: 'circle',
                    filter: ['all', ['==', 'ghg_fixed', 0]],
                },
                {
                    paint: {
                        'circle-color': '#fee5d9',
                    },
                    'source-layer': 'layer0',
                    type: 'circle',
                    filter: [
                        'all',
                        ['>', 'ghg_fixed', 0],
                        ['<', 'ghg_fixed', 20000],
                    ],
                },
                {
                    paint: {
                        'circle-color': '#fcae91',
                    },
                    'source-layer': 'layer0',
                    type: 'circle',
                    filter: [
                        'all',
                        ['>=', 'ghg_fixed', 20000],
                        ['<', 'ghg_fixed', 40000],
                    ],
                },
                {
                    paint: {
                        'circle-color': '#fb6a4a',
                    },
                    'source-layer': 'layer0',
                    type: 'circle',
                    filter: [
                        'all',
                        ['>=', 'ghg_fixed', 40000],
                        ['<', 'ghg_fixed', 80000],
                    ],
                },
                {
                    paint: {
                        'circle-color': '#de2d26',
                    },
                    'source-layer': 'layer0',
                    type: 'circle',
                    filter: [
                        'all',
                        ['>=', 'ghg_fixed', 80000],
                        ['<', 'ghg_fixed', 200000],
                    ],
                },
                {
                    paint: {
                        'circle-color': '#a50f15',
                    },
                    'source-layer': 'layer0',
                    type: 'circle',
                    filter: ['all', ['>=', 'ghg_fixed', 200000]],
                },
            ],
        },
    },
    legendConfig: {
        items: [
            {
                color: '#fee5d9',
                name: '<20',
                id: 0,
            },
            {
                color: '#fcae91',
                name: '<40',
                id: 1,
            },
            {
                color: '#fb6a4a',
                name: '<80',
                id: 2,
            },
            {
                color: '#de2d26',
                name: '<200',
                id: 3,
            },
            {
                color: '#a50f15',
                name: '≥200',
                id: 4,
            },
            {
                color: '#808080',
                name: 'No data',
                id: 5,
            },
        ],
        type: 'choropleth',
    },
    interactionConfig: {
        output: [
            {
                column: 'state',
                format: null,
                prefix: '',
                property: 'State',
                suffix: '',
                type: 'string',
            },
            {
                column: 'city_name',
                format: null,
                prefix: '',
                property: 'City',
                suffix: '',
                type: 'string',
            },
            {
                column: 'facility_name',
                format: null,
                prefix: '',
                property: 'Facility',
                suffix: '',
                type: 'string',
            },
            {
                column: 'parent_companies',
                format: null,
                prefix: '',
                property: 'Company Ownership',
                suffix: '',
                type: 'string',
            },
            {
                column: 'ghg_quantity_metric_tons_co2e',
                format: '0,0',
                prefix: '',
                property: 'GHG Quantity',
                suffix: ' MT CO₂e',
                type: 'number',
            },
        ],
    },
    applicationConfig: {},
    staticImageConfig: {},
    createdAt: '2021-03-04T21:37:28.562Z',
    updatedAt: '2021-12-22T17:08:12.956Z',
}
