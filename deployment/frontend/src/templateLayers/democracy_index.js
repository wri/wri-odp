export const democracy_index = {
    id: 'c3340efd-4a1c-40d6-9106-5157632a3dba',
    name: '2014 Overall Environmental Democracy Index Score',
    slug: 'overall-environmental-democracy-index-score',
    dataset: '0b9f0100-ce5b-430f-ad8f-3363efa05481',
    description:
        'The environmental democracy index aims to assess the state of national laws that protect transparency, participation, and justice in environmental decision-making. The index is calculated by combining 75 legal indicators that are scored on a range from 0 (worst) to 3 (best), producing an overall score that falls within this same range. These indicators test both the extent of provisions that promote environmental democracy as well as the ability to enforce these provisions as a legal right for the public. The data being shown represent the laws in place in 2014.',
    application: ['rw'],
    iso: [],
    provider: 'cartodb',
    type: 'layer',
    userId: '5980838ae24e6a1dae3dd446',
    default: true,
    protected: false,
    published: true,
    thumbnailUrl:
        'https://s3.amazonaws.com/wri-api-backups/resourcewatch/prod/thumbnails/929ffb0b-9a13-4617-9a60-9f7c9a83090f-1643736539945.png',
    env: 'production',
    layerConfig: {
        type: 'vector',
        source: {
            type: 'vector',
            provider: {
                type: 'carto',
                account: 'insights',
                layers: [
                    {
                        options: {
                            sql: 'SELECT * FROM edi',
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
                            ['to-number', ['get', 'overall_score']],
                            '#f6eff7',
                            0.5,
                            '#d0d1e6',
                            1,
                            '#a6bddb',
                            1.5,
                            '#67a9cf',
                            2,
                            '#1c9099',
                            2.5,
                            '#016c59',
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
                color: '#f6eff7',
                id: 0,
            },
            {
                name: '<1.0',
                color: '#d0d1e6',
                id: 1,
            },
            {
                name: '<1.5',
                color: '#a6bddb',
                id: 2,
            },
            {
                name: '<2.0',
                color: '#67a9cf',
                id: 3,
            },
            {
                name: '<2.5',
                color: '#1c9099',
                id: 4,
            },
            {
                color: '#016c59',
                name: '<3',
                id: 5,
            },
        ],
    },
    interactionConfig: {
        output: [
            {
                column: 'country',
                format: null,
                prefix: '',
                property: 'Country',
                suffix: '',
                type: 'string',
                enabled: true,
            },
            {
                column: 'overall_score',
                format: null,
                prefix: '',
                property: 'Environmental Democracy Index',
                suffix: '',
                type: 'number',
                enabled: true,
            },
        ],
    },
    applicationConfig: {},
    staticImageConfig: {},
    createdAt: '2017-09-13T14:24:32.159Z',
    updatedAt: '2022-02-01T17:28:59.881Z',
}
