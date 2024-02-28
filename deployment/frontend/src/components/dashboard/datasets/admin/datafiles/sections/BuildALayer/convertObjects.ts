import { match, P } from 'ts-pattern'
import {
    ColorPatternType,
    InteractionFormType,
    LayerFormType,
    layerSchema,
    LegendsFormType,
    RawLayerFormType,
} from './layer.schema'
import { v4 as uuidv4 } from 'uuid'
import { APILayerSpec } from '@/interfaces/layer.interface'
import { rampTypes } from '../../../formOptions'

export function convertFormToLayerObj(formData: LayerFormType): APILayerSpec {
    return {
        ...formData,
        type: 'layer',
        provider: 'cartodb',
        dataset: formData.dataset ?? '',
        applicationConfig: formData.applicationConfig ?? {},
        staticImageConfig: formData.staticImageConfig ?? {},
        published: formData.published ?? false,
        default: formData.published ?? false,
        env: formData.env ?? 'staging',
        protected: formData.protected ?? false,
        iso: formData.iso ?? [],
        application: formData.application ?? ['data-explorer'],
        id: formData.id ?? uuidv4(),
        rw_id: formData.id ?? uuidv4(),
        interactionConfig: formData.interactionConfig
            ? {
                  output: formData.interactionConfig.output.filter((item) => {
                      if (typeof item.enabled === 'undefined') return true
                      return !!item.enabled
                  }),
              }
            : undefined,
        legendConfig:
            formData.legendConfig &&
            formData.legendConfig.items &&
            formData.legendConfig.items.length > 0
                ? formData.legendConfig
                : {},
        layerConfig: {
            ...formData.layerConfig,
            source: removeKeysWithUndefined({
                type: formData.layerConfig.type.value,
                ...formData.layerConfig.source,
                tiles: formData.layerConfig.source?.tiles
                    ? [formData.layerConfig.source?.tiles]
                    : null,
                provider: {
                    ...formData.layerConfig.source?.provider,
                    type: formData.layerConfig.source?.provider.type.value,
                },
            }),
            type: formData.layerConfig.type.value,
            render:
                formData.layerConfig.source?.provider.type.value === 'carto'
                    ? {
                          layers: formData.layerConfig.render?.layers.map(
                              (layer) => ({
                                  type: layer.type.value,
                                  'source-layer': layer['source-layer'],
                                  paint:
                                      layer.paint &&
                                      removeKeysWithUndefined({
                                          'circle-opacity':
                                              layer.type.value === 'circle'
                                                  ? layer.paint[
                                                        'circle-opacity'
                                                    ] ?? undefined
                                                  : undefined,
                                          'circle-radius':
                                              layer.type.value === 'circle'
                                                  ? layer.paint[
                                                        'circle-radius'
                                                    ] ?? undefined
                                                  : undefined,
                                          'circle-color': matchColorPattern(
                                              layer.type.value === 'circle'
                                                  ? layer.paint[
                                                        'circle-color'
                                                    ] ?? undefined
                                                  : undefined
                                          ),
                                          'line-width':
                                              layer.type.value === 'line'
                                                  ? layer.paint['line-width'] ??
                                                    undefined
                                                  : undefined,
                                          'line-opacity':
                                              layer.type.value === 'line'
                                                  ? layer.paint[
                                                        'line-opacity'
                                                    ] ?? undefined
                                                  : undefined,
                                          'line-color': matchColorPattern(
                                              layer.type.value === 'line'
                                                  ? layer.paint['line-color'] ??
                                                        undefined
                                                  : undefined
                                          ),
                                          'fill-opacity':
                                              layer.type.value === 'fill'
                                                  ? layer.paint[
                                                        'fill-opacity'
                                                    ] ?? undefined
                                                  : undefined,
                                          'fill-color': matchColorPattern(
                                              layer.type.value === 'fill'
                                                  ? layer.paint['fill-color'] ??
                                                        undefined
                                                  : undefined
                                          ),
                                      }),
                                  filter: layer.filter.map((filter) =>
                                      typeof filter === 'string'
                                          ? filter
                                          : [
                                                filter.operation?.value ?? '==',
                                                filter.column?.value ?? '',
                                                filter.value,
                                            ]
                                  ),
                              })
                          ),
                      }
                    : {},
        },
    }
}

function removeKeysWithUndefined(obj: any) {
    return Object.fromEntries(
        Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null)
    )
}

function matchColorPattern(colorPattern: ColorPatternType) {
    return match(colorPattern)
        .with(undefined, () => undefined)
        .with(null, () => undefined)
        .with(P.string, (color) => color)
        .with(
            {
                type: {
                    value: P.select(
                        'type',
                        P.union(
                            'interpolate',
                            'interpolate-lab',
                            'interpolate-hcl'
                        )
                    ),
                },
                input: P.select('input'),
                interpolationType: P.select('interpolation'),
                output: P.select('output'),
            },
            ({ type, output, input, interpolation }) => [
                type,
                [interpolation?.value ?? 'linear'],
                typeof input === 'number'
                    ? [input]
                    : [input.coercion, [input.operation, input.column?.value]],
                ...output
                    .flatMap((o) => [o.value, o.color])
                    .filter((item) => !(!item && item !== 0)),
            ]
        )
        .with(
            {
                type: { value: 'step' },
                input: P.select('input'),
                output: P.select('output'),
            },
            ({ output, input }) => [
                'step',
                typeof input === 'number'
                    ? [input]
                    : [input.coercion, [input.operation, input.column?.value]],
                ...output
                    .flatMap((o) => [o.color, o.value])
                    .filter((item) => !(!item && item !== 0)),
            ]
        )
        .otherwise(() => '#000000')
}

export function convertLayerObjToForm(layerObj: APILayerSpec): LayerFormType {
    return {
        ...layerObj,
        interactionConfig: {
            output:
                layerObj.interactionConfig?.output?.map((item) => ({
                    ...item,
                    enabled: true,
                })) ?? [],
        },
        legendConfig: (layerObj.legendConfig as
            | LegendsFormType
            | undefined) ?? { type: 'basic', items: [] },
        description: layerObj.description ?? '',
        dataset: layerObj.dataset ?? '',
        provider: layerObj.provider ?? 'cartodb',
        type: layerObj.type ?? 'layer',
        layerConfig: {
            ...layerObj.layerConfig,
            type: {
                value: layerObj.layerConfig.source?.type ?? 'raster',
                label: layerObj.layerConfig.source.type ?? 'Raster',
            },
            render: parseRender(layerObj.layerConfig.render ?? {}),
            source: {
                ...layerObj.layerConfig.source,
                tiles:
                    'tiles' in layerObj.layerConfig.source &&
                    layerObj.layerConfig.source?.tiles &&
                    layerObj.layerConfig.source?.tiles[0]
                        ? (layerObj.layerConfig.source.tiles[0] as string)
                        : undefined,
                provider: {
                    ...layerObj.layerConfig.source.provider,
                    layers: layerObj.layerConfig.source.provider?.layers ?? [],
                    type: {
                        value:
                            (layerObj.layerConfig.source.provider
                                ?.type as any) ?? 'other',
                        label:
                            layerObj.layerConfig.source.provider?.type ??
                            'Other',
                    },
                },
            },
        },
    }
}

function mapByTwo(list: Array<any>) {
    return list.reduce((accumulator, currentValue, currentIndex, array) => {
        if (currentIndex % 2 === 0) {
            accumulator.push(array.slice(currentIndex, currentIndex + 2))
        }
        return accumulator
    }, [])
}

function parseInputExpr(input: any) {
    return match(input)
        .with(P.string, () => input)
        .with(['to-number', ['get', P.select('value')]], ({ value }) => ({
            coercion: 'to-number',
            operation: 'get',
            column: { value, label: value },
        }))
        .otherwise(() => undefined)
}

function parsePaintColor(color: any) {
    const colorObj = match(color)
        .with(P.select(P.string), (color) => color)
        .with(
            ['step', P.select('input'), ...P.array(P.select('rest'))],
            ({ input, rest }) => ({
                type: { value: 'step', label: 'Step' },
                input: parseInputExpr(input),
                output: mapByTwo(rest).map((item: any) => ({
                    color: item[0],
                    value: item[1],
                })),
            })
        )
        .with(
            [
                P.select(
                    'type',
                    P.union('interpolate', 'interpolate-lab', 'interpolate-hcl')
                ),
                P.select('interpolationType', ['linear']),
                P.select('input'),
                ...P.array(P.select('rest')),
            ],
            ({ type, input, rest }) => ({
                type: rampTypes.find((item) => item.value === type) ?? {
                    value: 'interpolate',
                    label: 'Interpolate',
                },
                interpolationType: {
                    value: 'linear',
                    label: 'Linear',
                },
                input: parseInputExpr(input),
                output: mapByTwo(rest).map((item: any) => ({
                    color: item[1],
                    value: item[0],
                })),
            })
        )
        .otherwise(() => undefined)
    return colorObj
}

function parseRender(render: any) {
    const _render = {
        layers: render.layers?.map((layer: any) => ({
            type: {
                value: layer.type,
                label: layer.type,
            },
            'source-layer': layer['source-layer'],
            paint: removeKeysWithUndefined({
                'circle-opacity': layer.paint['circle-opacity'],
                'circle-radius': layer.paint['circle-radius'],
                'circle-color': parsePaintColor(layer.paint['circle-color']),
                'line-width': layer.paint['line-width'],
                'line-opacity': layer.paint['line-opacity'],
                'line-color': parsePaintColor(layer.paint['line-color']),
                'fill-opacity': layer.paint['fill-opacity'],
                'fill-color': parsePaintColor(layer.paint['fill-color']),
            }),
            filter: match(layer.filter)
                .with(['all'], () => ['all'])
                .with(
                    [
                        'all',
                        ...P.array(
                            P.select(
                                'filter',
                                P.array(P.union(P.string, P.number))
                            )
                        ),
                    ],
                    ({ filter }) => {
                        return [
                            'all',
                            ...filter.map((_filter) => {
                                if (typeof _filter === 'string') return _filter
                                return {
                                    operation: {
                                        value: _filter[0],
                                        label: _filter[0],
                                    },
                                    column: {
                                        value: _filter[1],
                                        label: _filter[1],
                                    },
                                    value: _filter[2],
                                }
                            }),
                        ]
                    }
                )
                .otherwise(() => {
                    return []
                }),
        })),
    }
    return _render
}

export const getApiSpecFromRawObj = (rawLayerFormObj: RawLayerFormType) => {
    const { generalConfig, layerConfig, interactionConfig, legendConfig } =
        rawLayerFormObj
    try {
        const apiSpec = {
            ...JSON.parse(generalConfig ?? '{}'),
            layerConfig: JSON.parse(layerConfig ?? '{}'),
            interactionConfig: JSON.parse(interactionConfig ?? '{}'),
            legendConfig: JSON.parse(legendConfig ?? '{}'),
        }
        return apiSpec
    } catch (e) {
        console.log(e)
        throw new Error('Could not convert to layer object')
    }
}

export const getRawObjFromApiSpec = (apiSpec: APILayerSpec) => {
    const { layerConfig, interactionConfig, legendConfig, id, ...attributes } =
        apiSpec
    return {
        id,
        rw_id: id,
        generalConfig: JSON.stringify(attributes, null, 2),
        layerConfig: JSON.stringify(layerConfig, null, 2),
        interactionConfig: JSON.stringify(interactionConfig, null, 2),
        legendConfig: JSON.stringify(legendConfig, null, 2),
    }
}
