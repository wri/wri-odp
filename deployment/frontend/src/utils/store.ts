import {
  ActiveLayerGroup,
  Basemap,
  Labels,
  LayerState,
  Layers,
  State,
  Bounds,
} from "@/interfaces/state.interface";
import { useLayoutEffect } from "react";
import { ViewState } from "react-map-gl";
import { UseBoundStore, create} from "zustand";
import createContext from "zustand/context";
import { combine } from "zustand/middleware";

let store: any;

type InitialState = ReturnType<typeof getDefaultInitialState>;
type UseStoreState = typeof initializeStore extends (
  ...args: never
) => UseBoundStore<infer T>
  ? T
  : never;

const getDefaultInitialState = () => {
  const initialState: State & Layers = {
    activeLayerGroups: [],
    basemap: "dark",
    labels: "light",
    boundaries: false,
    layersParsed: [],
    layers: new Map<string, LayerState>(),
    viewState: {
      latitude: 0,
      longitude: 0,
      zoom: 3,
      bearing: 0,
      pitch: 0,
      padding: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      },
    },
    bounds: {
      bbox: null,
      options: {},
    },
    isDrawing: undefined,
  };
  return initialState;
};

const zustandContext = createContext<UseStoreState>();
export const Provider = zustandContext.Provider;
export const useStore = zustandContext.useStore;

export const initializeStore = (preloadedState = {}) => {
  return create(
    combine({ ...getDefaultInitialState(), ...preloadedState }, (set, get) => ({
      setViewState: (newViewState: ViewState) => {
        set({
          viewState: newViewState,
        });
      },
      setBaseMap: (newBasemap: Basemap) => {
        set({
          basemap: newBasemap,
        });
      },
      setBounds: (newBounds: Bounds) => {
        set({
          bounds: newBounds,
        });
      },
      setLabels: (newLabels: Labels) => {
        set({
          labels: newLabels,
        });
      },
      setBoundaries: (newBoundaries: boolean) => {
        set({
          boundaries: newBoundaries,
        });
      },
      setIsDrawing: (newIsDrawing: boolean) => {
        set({
          isDrawing: newIsDrawing,
        });
      },
      replaceLayerGroups: (layerGroups: ActiveLayerGroup[]) => {
        set({
          activeLayerGroups: layerGroups,
        });
      },
      addLayerGroup: (layerGroup: ActiveLayerGroup) => {
        const activeLayerGroups = get().activeLayerGroups;
        set({
          activeLayerGroups: [layerGroup, ...activeLayerGroups],
        });
      },
      removeLayerGroup: (layerGroup: ActiveLayerGroup) => {
        const activeLayerGroups = get().activeLayerGroups;
        set({
          activeLayerGroups: activeLayerGroups.filter(
            (d) => JSON.stringify(d) !== JSON.stringify(layerGroup)
          ),
        });
      },
      updateLayerState: (
        layerId: string,
        keyName: string,
        newValue: number | boolean
      ) => {
        const currentLayers = get().layers;
        if (!currentLayers.has(layerId)) currentLayers.set(layerId, {});
        const currentLayer = currentLayers.get(layerId);
        currentLayers.set(layerId, {
          ...currentLayer,
          [keyName]: newValue,
        } as LayerState);
        set({
          layers: currentLayers,
        });
      },
    }))
  );
};

export const useCreateStore = (serverInitialState: InitialState) => {
  // For SSR & SSG, always use a new store.
  if (typeof window === "undefined") {
    return () => initializeStore(serverInitialState);
  }

  const isReusingStore = Boolean(store);
  // For CSR, always re-use same store.
  store = store ?? initializeStore(serverInitialState);
  // And if initialState changes, then merge states in the next render cycle.
  //
  // eslint complaining "React Hooks must be called in the exact same order in every component render"
  // is ignorable as this code runs in same order in a given environment
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useLayoutEffect(() => {
    // serverInitialState is undefined for CSR pages. It is up to you if you want to reset
    // states on CSR page navigation or not. I have chosen not to, but if you choose to,
    // then add `serverInitialState = getDefaultInitialState()` here.
    if (serverInitialState && isReusingStore) {
      store.setState(
        {
          // re-use functions from existing store
          ...store.getState(),
          // but reset all other properties.
          ...serverInitialState,
        },
        true // replace states, rather than shallow merging
      );
    }
  });

  return () => store;
};
