//@ts-ignore
import { PluginMapboxGl } from 'layer-manager'
import { useMap } from 'react-map-gl'
import {
    Layer,
    LayerManager as VizzLayerManager,
//@ts-ignore
} from 'layer-manager/dist/components'
//@ts-ignore
import type { LayerSpec, ProviderMaker } from '@vizzuality/layer-manager'
import pick from 'lodash/pick'
import { CartoProvider } from '@/utils/providers/cartoProvider'
import { TileProvider } from '@/utils/providers/tileProvider'
import { GeeProvider } from '@/utils/providers/geeProvider'
import { APILayerSpec } from '@/interfaces/layer.interface'
import { useMemo } from 'react'

export const parseLayers = (layers: APILayerSpec[]): LayerSpec[] => {
    return layers.map((layer): LayerSpec => {
        const { id, layerConfig } = layer
        let layerProps: any = pick(layerConfig, [
            'deck',
            'images',
            'interactivity',
            'opacity',
            'params',
            'sqlParams',
            'source',
            'type',
            'render',
            'visibility',
            'zIndex',
            'params_config',
        ])

        return {
            id,
            ...layerProps,
        }
    })
}

const geeProvider = new GeeProvider()
const cartoProvider = new CartoProvider()
const tileProvider = new TileProvider()
const providers: Record<string, ProviderMaker['handleData']> = {
    [geeProvider.name]: geeProvider.handleData,
    [cartoProvider.name]: cartoProvider.handleData,
    [tileProvider.name]: tileProvider.handleData,
}

const LayerManagerPreview = ({
    layers,
}: {
    layers: APILayerSpec[]
}): JSX.Element => {
    const { current: map } = useMap()
    const parsedLayers = useMemo(() => parseLayers(layers), [layers])

    return map ? (
        <VizzLayerManager
            map={map?.getMap()}
            plugin={PluginMapboxGl}
            providers={providers}
        >
            {parsedLayers &&
                parsedLayers.map((_layer: any) => {
                    return <Layer key={_layer.id} {..._layer} />
                })}
        </VizzLayerManager>
    ) : (
        <></>
    )
}

export default LayerManagerPreview
