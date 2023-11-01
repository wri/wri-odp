import VizzLayerManager from "./VizzLayerManager";
import Layer from "./Layer";
import PluginMapboxGl from "@vizzuality/layer-manager-plugin-mapboxgl";
import { useMap } from "react-map-gl";
import type { LayerSpec, ProviderMaker } from "@vizzuality/layer-manager";
import pick from "lodash/pick";
import CartoProvider from "@vizzuality/layer-manager-provider-carto";
import { TileProvider } from "@/utils/providers/tileProvider";
import { GeeProvider } from "@/utils/providers/geeProvider";
import { APILayerSpec } from "@/interfaces/layer.interface";
import { useLayerStates } from "@/utils/storeHooks";
import { LayerState } from "@/interfaces/state.interface";
import { useMemo } from "react";

export const parseLayers = (
  layers: APILayerSpec[],
  layerStates: Map<string, LayerState>
): LayerSpec[] => {
  return layers.map((layer): LayerSpec => {
    const { id, layerConfig } = layer;
    const layerState = layerStates.get(id);
    let layerProps: any = pick(layerConfig, [
      "deck",
      "images",
      "interactivity",
      "opacity",
      "params",
      "sqlParams",
      "source",
      "type",
      "render",
      "visibility",
      "zIndex",
      "params_config",
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
const providers: Record<string, ProviderMaker["handleData"]> = {
  [geeProvider.name]: geeProvider.handleData,
  [cartoProvider.name]: cartoProvider.handleData,
  [tileProvider.name]: tileProvider.handleData,
};

const LayerManager = ({ layers }: { layers: APILayerSpec[] }): JSX.Element => {
  const { current: map } = useMap();
  const { currentLayers } = useLayerStates();
  const parsedLayers = useMemo(
    () => parseLayers(layers, currentLayers),
    [layers, currentLayers]
  );
  return map ? (
    <VizzLayerManager
      map={map?.getMap()}
      plugin={PluginMapboxGl}
      providers={providers}
    >
      {parsedLayers &&
        parsedLayers.map((_layer: any) => {
          return <Layer key={_layer.id} {..._layer} />;
        })}
    </VizzLayerManager>
  ) : (
    <></>
  );
};

export default LayerManager;
