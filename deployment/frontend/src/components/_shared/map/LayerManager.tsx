//import VizzLayerManager from './VizzLayerManager'
//@ts-ignore
import { PluginMapboxGl } from 'layer-manager'
import { useMap } from 'react-map-gl'
import type { LayerSpec, ProviderMaker } from '@vizzuality/layer-manager'
//@ts-ignore
import { Layer, LayerManager as VizzLayerManager } from 'layer-manager/dist/components'
import pick from 'lodash/pick'
import { CartoProvider } from '@/utils/providers/cartoProvider'
import { TileProvider } from '@/utils/providers/tileProvider'
import { GeeProvider } from '@/utils/providers/geeProvider'
import { APILayerSpec, DeckLayerSpec } from '@/interfaces/layer.interface'
import { useLayerStates } from '@/utils/storeHooks'
import { LayerState } from '@/interfaces/state.interface'
import { useMemo } from 'react'
import { createDeckLayer } from '@/utils/decodeFunctions'

export const parseLayers = (
    layers: APILayerSpec[],
    layerStates: Map<string, LayerState>
): any[] => {
    return layers.map((layer: APILayerSpec) => {
        const { id, layerConfig } = layer
        const layerState = layerStates.get(id)
        if (layerConfig.decode_function) return createDeckLayer(layerConfig, id, layerState)
        let layerProps: any = pick(layerConfig, [
            'deck',
            'images',
            'interactivity',
            'opacity',
            'threshold',
            'params',
            'sqlParams',
            'source',
            '_ogSource',
            'type',
            'render',
            'visibility',
            'zIndex',
            'params_config',
        ])

        if (layerState) {
            layerProps = {
                ...layerProps,
                ...layerState,
                visibility: layerState.active ? layerState.visibility : false,
            }
        }

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

const LayerManager = ({ layers }: { layers: APILayerSpec[] }): JSX.Element => {
    const { current: map } = useMap()
    const { currentLayers } = useLayerStates()
    const parsedLayers = useMemo(() => {
        const parsedLayers = parseLayers(layers, currentLayers)
        return parsedLayers
    }, [layers, currentLayers])

    return map && map.getMap() ? (
        <VizzLayerManager
            map={map.getMap()}
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

export default LayerManager
