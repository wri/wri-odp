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
import { useActiveLayerGroups, useLayerStates } from '@/utils/storeHooks';
import { type LayerState } from '@/interfaces/state.interface';
import { useEffect, useMemo, useState } from 'react';
import { createDeckLayer } from '@/utils/decodeFunctions';
import React from 'react';

const parseLayers = (
    layers: APILayerSpec[],
    layerStates: Map<string, LayerState>
): any[] => {
    return layers.map((layer: APILayerSpec) => {
        const { id, layerConfig } = layer;
        const layerState = layerStates.get(id);
        if (layerConfig.decode_function) {
            return createDeckLayer(layerConfig, id, layerState);
        }

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

class SafePluginMapboxGl extends (PluginMapboxGl as any) {
    getLayersOnMap() {
        const style = this.map?.getStyle?.();
        return style?.layers ?? [];
    }

    setOpacity(layerModel: any, opacity: number) {
        const PAINT_STYLE_NAMES: Record<string, string[]> = {
            symbol: ['icon', 'text'],
            circle: ['circle', 'circle-stroke'],
        };

        const mapLayer = layerModel?.mapLayer;
        const decodeFunction = layerModel?.decodeFunction;

        if (!this.map?.style || !mapLayer?.layers) {
            return;
        }

        if (!decodeFunction) {
            mapLayer.layers.forEach((l: any) => {
                if (!l?.id || !this.map?.getLayer?.(l.id)) return;

                const paintStyleNames = PAINT_STYLE_NAMES[l.type] || [l.type];
                paintStyleNames.forEach((name) => {
                    const propertyName = `${name}-opacity`;
                    const propertyValue = this.computePaintPropertyValue(
                        layerModel,
                        l.id,
                        propertyName,
                        opacity
                    );

                    try {
                        this.map.setPaintProperty(l.id, propertyName, propertyValue);
                    } catch {
                        // The map style can still be rebuilding between checks.
                    }
                });
            });
            return;
        }

        const layer = mapLayer.layers[1];
        if (layer && typeof layer.setProps === 'function') {
            layer.setProps({ opacity });
        }
    }
}

const isMapUsable = (mapInstance: any) => {
    if (!mapInstance) return false;
    if (mapInstance._removed) return false;
    if (typeof mapInstance.getStyle !== 'function') return false;

    try {
        return !!mapInstance.getStyle();
    } catch {
        return false;
    }
};

const LayerManager = ({
    layers,
    datasetId,
    layerRwId,
}: {
    layers: APILayerSpec[];
    datasetId?: string;
    layerRwId?: string | null;
}) => {
    const { current: map } = useMap();
    const { currentLayers } = useLayerStates();
    const { addLayerToLayerGroup, removeLayerFromLayerGroup } = useActiveLayerGroups();
    const [mapInstance, setMapInstance] = useState<any | null>(null);
    const [isStyleReady, setIsStyleReady] = useState(false);
    const [isManagerReady, setIsManagerReady] = useState(false);

    useEffect(() => {
        if (!map) {
            setMapInstance(null);
            setIsStyleReady(false);
            return;
        }

        if (!mapInstance && map?.getMap) {
            const instance = map.getMap();
            if (instance) {
                setMapInstance(instance);
            }
        }
    }, [map, mapInstance]);

    useEffect(() => {
        if (!isMapUsable(mapInstance)) return;

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

    const visibleLayers = parsedLayers?.filter((l) => l.visibility) ?? [];

    useEffect(() => {
        if (!isMapUsable(mapInstance) || !isStyleReady) {
            setIsManagerReady(false);
            return;
        }

        let raf = 0;
        raf = window.requestAnimationFrame(() => {
            setIsManagerReady(true);
        });

        return () => {
            window.cancelAnimationFrame(raf);
            setIsManagerReady(false);
        };
    }, [isStyleReady, mapInstance]);

    useEffect(() => {
        if (!isMapUsable(mapInstance) || !isStyleReady || !datasetId || !layerRwId) return;

        removeLayerFromLayerGroup(layerRwId, datasetId);
        addLayerToLayerGroup(layerRwId, datasetId, undefined, true);

        return () => {
            removeLayerFromLayerGroup(layerRwId, datasetId);
        };
    }, [addLayerToLayerGroup, datasetId, isStyleReady, layerRwId, mapInstance, removeLayerFromLayerGroup]);

    if (!isMapUsable(mapInstance) || !isStyleReady) {
        return null;
    }

    return React.createElement(
        VizzLayerManager,
        {
            map: mapInstance,
            plugin: SafePluginMapboxGl,
            providers,
        },
        (isManagerReady ? visibleLayers : []).map((_layer: any) =>
            React.createElement(Layer, { key: _layer.id, ..._layer })
        )
    );
};

export default LayerManager;