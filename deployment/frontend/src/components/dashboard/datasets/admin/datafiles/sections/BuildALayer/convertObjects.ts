import { match, P } from 'ts-pattern'
import {
    ColorPatternType,
    InteractionFormType,
    LayerFormType,
    layerSchema,
    LegendsFormType,
} from './layer.schema'
import { v4 as uuidv4 } from 'uuid'
import { APILayerSpec } from '@/interfaces/layer.interface'

export function convertFormToLayerObj(formData: LayerFormType): APILayerSpec {
    return {
        ...formData,
        type: formData.type.value,
        dataset: '',
        userId: '',
        applicationConfig: {},
        staticImageConfig: {},
        published: false,
        default: false,
        env: 'staging',
        thumbnailUrl: '',
        protected: false,
        iso: [],
        provider: formData.source?.provider.type.value ?? '',
        application: ['rw'],
        id: formData.id ?? uuidv4(),
        interactionConfig: formData.interactionConfig
            ? {
                  output: formData.interactionConfig.output.filter(
                      (item) => item.enabled
                  ),
              }
            : {},
        legendConfig:
            formData.legendConfig &&
            formData.legendConfig.items &&
            formData.legendConfig.items.length > 0
                ? formData.legendConfig
                : {},
        layerConfig: {
            type: formData.type.value,
            render:
                formData.source?.provider.type.value === 'carto'
                    ? {
                          layers: formData.render?.layers.map((layer) => ({
                              type: layer.type.value,
                              'source-layer': layer['source-layer'],
                              paint:
                                  layer.paint &&
                                  removeKeysWithUndefined({
                                      'circle-opacity':
                                          layer.type.value === 'circle'
                                              ? layer.paint['circle-opacity'] ??
                                                undefined
                                              : undefined,
                                      'circle-radius':
                                          layer.type.value === 'circle'
                                              ? layer.paint['circle-radius'] ??
                                                undefined
                                              : undefined,
                                      'circle-color': matchColorPattern(
                                          layer.type.value === 'circle'
                                              ? layer.paint['circle-color'] ??
                                                    undefined
                                              : undefined
                                      ),
                                      'line-width':
                                          layer.type.value === 'line'
                                              ? layer.paint['line-width'] ??
                                                undefined
                                              : undefined,
                                      'line-opacity':
                                          layer.type.value === 'line'
                                              ? layer.paint['line-opacity'] ??
                                                undefined
                                              : undefined,
                                      'line-color': matchColorPattern(
                                          layer.type.value === 'line'
                                              ? layer.paint['line-color'] ??
                                                    undefined
                                              : undefined
                                      ),
                                      'fill-opacity':
                                          layer.type.value === 'fill'
                                              ? layer.paint['fill-opacity'] ??
                                                undefined
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
                          })),
                      }
                    : {},
            source: removeKeysWithUndefined({
                type: formData.type.value,
                ...formData.source,
                tiles: formData.source?.tiles ? [formData.source?.tiles] : null,
                provider: {
                    ...formData.source?.provider,
                    type: formData.source?.provider.type.value,
                },
            }),
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

function convertLayerObjToForm(layerObj: APILayerSpec): LayerFormType {
    return {
        ...layerObj,
        ...layerObj.layerConfig,
        interactionConfig: (layerObj.interactionConfig as
            | InteractionFormType
            | undefined) ?? { output: [] },
        legendConfig: (layerObj.legendConfig as
            | LegendsFormType
            | undefined) ?? { type: 'basic', items: [] },
        description: layerObj.description ?? '',
        type: {
            value: layerObj.layerConfig.type,
            label: layerObj.layerConfig.type,
        },
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
                layers: layerObj.layerConfig.render?.layers,
                type: {
                    value:
                        (layerObj.layerConfig.source.provider?.type as any) ??
                        'other',
                    label:
                        layerObj.layerConfig.source.provider?.type ?? 'Other',
                },
            },
        },
    }
}
