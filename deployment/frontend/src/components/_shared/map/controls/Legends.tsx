import { useLayerGroupsFromRW } from "@/utils/queryHooks";
import { useActiveLayerGroups, useLayerStates } from "@/utils/storeHooks";
import { type APILayerSpec } from "@/interfaces/layer.interface";
import {
  Legend,
  LegendListItem,
  LegendItemToolbar,
  LegendItemButtonLayers,
  LegendItemButtonOpacity,
  LegendItemButtonVisibility,
  LegendItemTypes,
  LegendItemTimeStep,
  Icons,
} from "vizzuality-components";
import { LegendItemTimeline } from "old-vizzuality-components";
import { type ActiveLayerGroup } from "@/interfaces/state.interface";

export function Legends() {
  const { data: layerGroups } = useLayerGroupsFromRW();
  const { activeLayerGroups, replaceLayersGroups } = useActiveLayerGroups();
  const { currentLayers, updateLayerState } = useLayerStates();

  function reorderLayerGroups(newOrder: string[]) {
    const isActiveLayerGroup = (
      item: ActiveLayerGroup | undefined
    ): item is ActiveLayerGroup => {
      return !!item;
    };
    const newLayerGroups = newOrder
      .map((id) => {
        return activeLayerGroups.find((lg) => lg.datasetId === id);
      })
      .filter(isActiveLayerGroup);
    replaceLayersGroups(newLayerGroups);
  }

  if (!layerGroups) return <span>Loading...</span>;
  return (
    <div className="c-legend-map">
      <Icons />
      <Legend
        maxHeight={300}
        onChangeOrder={(datasetIds: string[]) => reorderLayerGroups(datasetIds)}
      >
        {layerGroups.map((lg: any, i: number) => {
          return (
            <LegendListItem
              index={i}
              key={lg.dataset}
              layerGroup={{
                ...lg,
                layers: lg.layers.map((l: APILayerSpec) => {
                  const layerState = currentLayers.get(l.id);
                  return {
                    ...l,
                    ...layerState,
                  };
                }),
              }}
              toolbar={
                <LegendItemToolbar>
                  <LegendItemButtonLayers />
                  <LegendItemButtonOpacity />
                  <LegendItemButtonVisibility />
                </LegendItemToolbar>
              }
              onChangeInfo={() => console.log("Info")}
              onChangeOpacity={(layer: any, newOpacity: number) => {
                updateLayerState(layer.id, "active", true);
                updateLayerState(layer.id, "opacity", newOpacity);
              }}
              onChangeVisibility={(layer: any) => {
                const layerState = currentLayers.get(layer.id);
                updateLayerState(layer.id, "active", true);
                updateLayerState(
                  layer.id,
                  "visibility",
                  typeof layerState?.visibility === "undefined"
                    ? false
                    : !layerState?.visibility
                );
              }}
              onChangeLayer={(layer: APILayerSpec) => {
                lg.layers.forEach((_layer: APILayerSpec) => {
                  updateLayerState(_layer.id, "active", false);
                });
                updateLayerState(layer.id, "active", true);
              }}
              onRemoveLayer={(layer: APILayerSpec) => console.log(layer)}
            >
              <LegendItemTypes />
              <LegendItemTimeStep
                defaultStyles={LEGEND_TIMELINE_PROPERTIES}
                handleChange={() => console.log("Change")}
                customClass="rw-legend-timeline"
                dots={true}
              />
              {lg.layers.length > 1 &&
                !lg.layers.find(
                  (l: APILayerSpec & { timelineParams: any }) =>
                    !!l.timelineParams
                ) && (
                  <LegendItemTimeline
                    onChangeLayer={(layer: APILayerSpec) => {
                      lg.layers
                        .filter(
                          (_layer: APILayerSpec) => _layer.id !== layer.id
                        )
                        .forEach((_layer: APILayerSpec) => {
                          updateLayerState(_layer.id, "active", false);
                        });
                      updateLayerState(layer.id, "active", true);
                    }}
                    customClass="rw-legend-timeline"
                    {...LEGEND_TIMELINE_PROPERTIES}
                  />
                )}
            </LegendListItem>
          );
        })}
      </Legend>
    </div>
  );
}

export const LEGEND_TIMELINE_PROPERTIES = {
  trackStyle: [{ backgroundColor: "#caccd0" }, { backgroundColor: "#caccd0" }],
  railStyle: {
    backgroundColor: "#caccd0",
    height: 2,
  },
  handleStyle: [
    {
      backgroundColor: "#c32d7b",
      width: 21,
      height: 21,
      borderWidth: 3,
      borderColor: "#fff",
      transform: "translate(calc(-50% + 6px), calc(-50% + 12px))",
      top: 0,
    },
    {
      backgroundColor: "#c32d7b",
      width: 21,
      height: 21,
      borderWidth: 3,
      borderColor: "#fff",
      transform: "translate(calc(-50% + 6px), calc(-50% + 12px))",
      top: 0,
    },
  ],
  dotStyle: {
    width: 16,
    height: 16,
    borderColor: "#caccd0",
    transform: "translate(calc(-50% + 4px), 50%)",
    bottom: "50%",
    borderWidth: 2,
  },
  activeDotStyle: {
    width: 16,
    height: 16,
    borderColor: "#caccd0",
    transform: "translate(calc(-50% + 4px), 50%)",
    bottom: "50%",
  },
  markStyle: {
    width: "auto",
    margin: 0,
    fontFamily: "'Lato', 'Helvetica Neue', Helvetica, Arial, sans",
    color: "#393f44",
  },
};
