import { shallow } from "zustand/shallow";
import { useStore } from "./store";

export const useMapState = () => {
  const { viewState, setViewState } = useStore(
    (store) => ({
      viewState: store.viewState,
      setViewState: store.setViewState,
    }),
    shallow
  );

  return { viewState, setViewState };
};

export const useBasemap = () => {
  const { selectedBasemap, setBasemap } = useStore(
    (store) => ({
      selectedBasemap: store.basemap,
      setBasemap: store.setBaseMap,
    }),
    shallow
  );

  return { selectedBasemap, setBasemap };
};

export const useIsDrawing = () => {
  const { isDrawing, setIsDrawing } = useStore(
    (store) => ({
      isDrawing: store.isDrawing,
      setIsDrawing: store.setIsDrawing,
    }),
    shallow
  );

  return { isDrawing, setIsDrawing };
};

export const useLabels = () => {
  const { selectedLabels, setLabels } = useStore(
    (store) => ({
      selectedLabels: store.labels,
      setLabels: store.setLabels,
    }),
    shallow
  );

  return { selectedLabels, setLabels };
};

export const useBoundaries = () => {
  const { showBoundaries, setShowBoundaries } = useStore(
    (store) => ({
      showBoundaries: store.boundaries,
      setShowBoundaries: store.setBoundaries,
    }),
    shallow
  );

  return { showBoundaries, setShowBoundaries };
};

export const useActiveLayerGroups = () => {
  const {
    activeLayerGroups,
    replaceLayersGroups,
    updateLayerGroup,
    addLayerGroup,
    removeLayerGroup,
  } = useStore((store) => ({
    activeLayerGroups: store.activeLayerGroups,
    replaceLayersGroups: store.replaceLayerGroups,
    updateLayerGroup: store.updateLayerGroup,
    addLayerGroup: store.addLayerGroup,
    removeLayerGroup: store.removeLayerGroup,
  }));

  return {
    activeLayerGroups,
    replaceLayersGroups,
    updateLayerGroup,
    addLayerGroup,
    removeLayerGroup,
  };
};

export const useLayerStates = () => {
  const { currentLayers, updateLayerState } = useStore((store) => ({
    currentLayers: store.layers,
    updateLayerState: store.updateLayerState,
  }));

  return { currentLayers, updateLayerState };
};

export const useBounds = () => {
  const { bounds, setBounds } = useStore((store) => ({
    bounds: store.bounds,
    setBounds: store.setBounds,
  }));

  return { bounds, setBounds };
};
