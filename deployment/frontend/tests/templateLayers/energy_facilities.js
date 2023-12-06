export const energy_facilities = {
    id: 'd5c3e961-9169-4923-b689-354b0aac10ca',
    name: '2016 Energy Facility Emissions ( MT CO₂e, thousands)',
    slug: '2015-Energy-Facility-Emissions-metric-tons-of-CO2-equivalent',
    dataset: '75061411-3afd-442f-b7d6-7607f97f639b',
    description:
        'Greenhouse gas emissions data for large emitters, facilities that inject CO₂ underground, and suppliers in the United States for 2016. Emissions are measured in thousands of metric tons of carbon dioxide equivalent (MT CO₂e).',
    application: ['rw'],
    iso: [],
    provider: 'cartodb',
    type: 'layer',
    userId: '5980838ae24e6a1dae3dd446',
    default: true,
    protected: false,
    published: true,
    env: 'production',
    layerConfig: {
        account: 'wri-rw',
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
                            sql: 'SELECT *, ghg_quantity_metric_tons_co2e AS ghg_fixed FROM ene_017_energy_facility_emissions_edit',
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
    createdAt: '2020-02-14T08:37:16.122Z',
    updatedAt: '2021-12-22T17:50:17.981Z',
}
