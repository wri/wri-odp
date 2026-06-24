//@ts-ignore
import { PluginMapboxGl } from 'wri-layer-manager';
import { useMap } from 'react-map-gl';
import {
    Layer,
    LayerManager as VizzLayerManager,
    //@ts-ignore
} from 'wri-layer-manager/dist/components';
import pick from 'lodash/pick';
import { CartoProvider } from '@/utils/providers/cartoProvider';
import { TileProvider } from '@/utils/providers/tileProvider';
import { GeeProvider } from '@/utils/providers/geeProvider';
import { VectorTileProvider } from '@/utils/providers/vectorProvider';
import { type APILayerSpec } from '@/interfaces/layer.interface';
import { useLayerStates } from '@/utils/storeHooks';
import { type LayerState } from '@/interfaces/state.interface';
import { useEffect, useMemo, useState } from 'react';
import { createDeckLayer } from '@/utils/decodeFunctions';

const parseLayers = (
    layers: APILayerSpec[],
    layerStates: Map<string, LayerState>
): any[] => {
    return layers.map((layer: APILayerSpec) => {
        const { id, layerConfig } = layer;
        const layerState = layerStates.get(id);
        if (layerConfig.decode_function)
            return createDeckLayer(layerConfig, id, layerState);
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
        ]);

        if (layerState) {
            layerProps = {
                ...layerProps,
                ...layerState,
                visibility: layerState.active ? layerState.visibility : false,
            };
        }

        return {
            id,
            ...layerProps,
        };
    });
};

const geeProvider = new GeeProvider();
const cartoProvider = new CartoProvider();
const tileProvider = new TileProvider();
const vectorProvider = new VectorTileProvider();
const providers: Record<string, any['handleData']> = {
    [vectorProvider.name]: vectorProvider.handleData,
    [geeProvider.name]: geeProvider.handleData,
    [cartoProvider.name]: cartoProvider.handleData,
    [tileProvider.name]: tileProvider.handleData,
};

const LayerManager = ({ layers }: { layers: APILayerSpec[] }): JSX.Element => {
    const { current: map } = useMap();
    const { currentLayers } = useLayerStates();
    const [mapInstance, setMapInstance] = useState<any | null>(null);
    const [isStyleReady, setIsStyleReady] = useState(false);

    useEffect(() => {
        if (!mapInstance && map?.getMap) {
            const instance = map.getMap();
            if (instance) {
                setMapInstance(instance);
            }
        }
    }, [map, mapInstance]);

    useEffect(() => {
        if (!mapInstance) return;

        const onStyleReady = () => setIsStyleReady(true);

        if (mapInstance.isStyleLoaded?.()) {
            setIsStyleReady(true);
            return;
        }

        mapInstance.once?.('load', onStyleReady);
        mapInstance.once?.('style.load', onStyleReady);

        return () => {
            mapInstance.off?.('load', onStyleReady);
            mapInstance.off?.('style.load', onStyleReady);
        };
    }, [mapInstance]);

    const parsedLayers = useMemo(() => {
        const parsedLayers = parseLayers(layers, currentLayers);
        return parsedLayers;
    }, [layers, currentLayers]);

    return mapInstance && isStyleReady ? (
        <VizzLayerManager
            map={mapInstance}
            plugin={PluginMapboxGl}
            providers={providers}
        >
            {parsedLayers &&
                parsedLayers
                    .filter((l) => l.visibility)
                    .map((_layer: any) => {
                        return <Layer key={_layer.id} {..._layer} />;
                    })}
        </VizzLayerManager>
    ) : (
        <></>
    );
};

export default LayerManager;
