import { match, P } from 'ts-pattern'
import { ColorPatternType, LayerFormType, layerSchema } from './layer.schema'

export function convertFormToLayerObj(formData: LayerFormType) {
    console.log('formData', formData.render)
    return {
        id: formData.id ?? 'sample-id',
        layerConfig: {
            type: formData.type.value,
            render: {
                layers: formData.render?.layers.map((layer) => ({
                    type: layer.type.value,
                    'source-layer': layer['source-layer'],
                    paint: layer.paint && removeKeysWithUndefined({
                        'circle-opacity':
                            layer.paint['circle-opacity'] ?? undefined,
                        'circle-radius':
                            layer.paint['circle-radius'] ?? undefined,
                        'line-width': layer.paint?.['line-width'] ?? undefined,
                        'line-opacity':
                            layer.paint['line-opacity'] ?? undefined,
                        'fill-opacity':
                            layer.paint['fill-opacity'] ?? undefined,
                        'circle-color': matchColorPattern(
                            layer.paint['circle-color']
                        ),
                        'fill-color': matchColorPattern(
                            layer.paint['fill-color']
                        ),
                        'line-color': matchColorPattern(
                            layer.paint['line-color']
                        ),
                    }),
                    filter: layer.filter.map((filter) =>
                        filter === 'all'
                            ? filter
                            : [
                                  filter.operation?.value ?? '==',
                                  filter.column,
                                  filter.value,
                              ]
                    ),
                })),
            },
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
                    value: P.select('type', P.union(
                        'interpolate',
                        'interpolate-lab',
                        'interpolate-hcl'
                    )),
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
                    : [input.coercion, [input.operation, input.column]],
                ...output.flatMap((o) => [o.value, o.color]).filter(item => !(!item && item !== 0)),
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
                    : [input.coercion, [input.operation, input.column]],
                ...output.flatMap((o) => [o.value, o.color]).filter(item => !(!item && item !== 0)),
            ]
        ).otherwise(() => '#000000')
}
