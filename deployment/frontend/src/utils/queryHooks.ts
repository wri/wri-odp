import { CKAN } from "@portaljs/ckan";
import { useQuery } from "react-query";
import flatten from "lodash/flatten";
import compact from "lodash/compact";
import isEmpty from "lodash/isEmpty";
import { APILayerSpec } from "@/interfaces/layer.interface";
import { useActiveLayerGroups, useLayerStates } from "./storeHooks";
import { ActiveLayerGroup, LayerState } from "@/interfaces/state.interface";

export async function packageSearch() {
  const ckan = new CKAN("https://ckan.x.demo.datopian.com");
  return await ckan.packageSearch({
    query: "",
    offset: 0,
    limit: 30,
    groups: [],
    orgs: [],
    tags: [],
  });
}

export const useDatasetsQuery = () => {
  return useQuery({
    queryKey: ["datasets"],
    queryFn: packageSearch,
  });
};

export async function getLayersFromRW(
  queryKey: any,
  currentLayers: Map<string, LayerState>
) {
  const [, activeLayerGroups] = queryKey;
  if (activeLayerGroups.length === 0) return [];
  let countdown = 10;
  return await Promise.all(
    activeLayerGroups.map(
      async (layerGroup: ActiveLayerGroup, index: number) => {
        const { datasetId, layers } = layerGroup;
        if (layers.length === 0) return [];
        const layersData = await Promise.all(
          layers.map(async (layer: string) => {
            const response = await fetch(
              `https://api.resourcewatch.org/v1/layer/${layer}`
            );
            const layerData = await response.json();
            const { id, attributes } = layerData.data;
            const currentLayer = currentLayers.get(id);
            return {
              id: id,
              ...attributes,
              layerConfig: {
                ...attributes.layerConfig,
                zIndex: countdown - index,
                visibility: layers.length > 1 ? attributes.default : true,
                ...currentLayer,
              },
              active: layers.length > 1 ? attributes.default : true,
            };
          })
        );
        return {
          dataset: datasetId,
          layers: layersData,
        };
      }
    )
  );
}

export const useLayerGroupsFromRW = () => {
  const { activeLayerGroups } = useActiveLayerGroups();
  const { currentLayers } = useLayerStates();
  return useQuery({
    queryKey: ["layers", activeLayerGroups],
    queryFn: ({ queryKey }) => getLayersFromRW(queryKey, currentLayers),
  });
};

export const useLayersFromRW = () => {
  const result = useLayerGroupsFromRW();

  if (result.data) {
    const data: APILayerSpec[] = result.data.filter(lg => lg.layers?.length > 0).reduce(
      (acc: any, layerGroup: any) => {
        return [...acc, ...layerGroup.layers];
      },
      []
    );
    return { ...result, data };
  }
  return { ...result, data: [] };
};

/**
 *
 * @param {object[]} activeLayers Array of layers that mean to be interactive
 * @returns {string[]} Array of Mapbox layers ids that mean to be interactive
 */
export function getInteractiveLayers(activeLayers: any): string[] | null {
  return flatten(
    compact(
      activeLayers.map((_activeLayer: any) => {
        const { id, layerConfig } = _activeLayer;
        if (isEmpty(layerConfig)) return null;

        // * keeps backward compatibility for now
        const vectorLayers =
          layerConfig.render?.layers || layerConfig.body?.vectorLayers;

        if (vectorLayers) {
          return vectorLayers.map((l: any, i: number) => {
            const { id: vectorLayerId, type: vectorLayerType } = l;
            return vectorLayerId || `${id}-${vectorLayerType}-${i}`;
          });
        }
        return null;
      })
    )
  );
}

export const useInteractiveLayers = () => {
  const result = useLayersFromRW();
  if (result.data) {
    const data = getInteractiveLayers(result.data);
    return { ...result, data };
  }
  return { ...result, data: [] };
};
