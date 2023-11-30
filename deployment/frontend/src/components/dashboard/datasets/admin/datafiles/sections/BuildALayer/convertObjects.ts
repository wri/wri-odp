import { LayerFormType, layerSchema } from './layer.schema'

export function convertFormToLayerObj(formData: LayerFormType) {
    return {
        id: formData.id ?? 'sample-id',
        layerConfig: {
            type: formData.type.value,
            render: {
                layers: formData.render?.layers.map((layer) => ({
                    type: layer.type.value,
                    'source-layer': layer['source-layer'],
                    paint: layer.paint,
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
            source: {
                ...formData.source,
                tiles: formData.source?.tiles ? [formData.source?.tiles] : null,
                provider: {
                    ...formData.source?.provider,
                    type: formData.source?.provider.type.value,
                    options: formData.source?.provider.options ?? {},
                },
            },
        },
    }
}
