import type {
    LayerModel,
    LayerSpec,
    Source,
    ProviderMaker,
} from '@vizzuality/layer-manager'
import omit from 'lodash/omit'

export class VectorTileProvider implements ProviderMaker {
    public name = 'vectorlayer'

    public handleData = (
        layerModel: LayerModel,
        layer: LayerSpec,
        resolve?: (layerSpec: LayerSpec) => void,
        reject?: (err: Error) => void
    ): void => {
        try {
            const result = {
                ...layer,
                source: {
                    ...omit(layer.source, 'provider'),
                    type: 'vector',
                    //@ts-ignore
                    tiles: [layer.source.tiles[0]],
                } as Source,
            }
            if (resolve) {
                resolve(result)
            }
        } catch (error: any) {
            if (reject) {
                reject(new Error(error.message))
            }
        }
    }
}
