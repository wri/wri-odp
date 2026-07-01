import { shallow } from 'zustand/shallow';
import { useStore, type AppStoreState } from './store';

export const useVizIndex = () => {
    const { vizIndex, setVizIndex } = useStore((store: AppStoreState) => ({
        vizIndex: store.vizIndex,
        setVizIndex: store.setVizIndex,
    }));
    return { vizIndex, setVizIndex };
};

export const useDataset = () => {
    const { dataset } = useStore((store: AppStoreState) => ({ dataset: store.dataset }));

    return { dataset };
};

export const useLayerAsLayerObj = () => {
    const { layerAsLayerObj } = useStore((store: AppStoreState) => ({
        layerAsLayerObj: store.layerAsLayerObj,
    }));

    return { layerAsLayerObj };
};
export const useActiveCharts = () => {
    return useStore((store: AppStoreState) => ({
        activeCharts: store.activeCharts,
        addCharts: store.addCharts,
        removeCharts: store.removeCharts,
        selectedChart: store.selectedChart,
        selectChart: store.selectChart,
    }));
};

export const useRelatedDatasets = () => {
    const { relatedDatasets } = useStore((store: AppStoreState) => ({
        relatedDatasets: store.relatedDatasets,
    }));

    return { relatedDatasets };
};

export const useIsEmbeddingMap = () => {
    const { isEmbedding } = useStore((store: AppStoreState) => ({
        isEmbedding: store.mapView.isEmbedding,
    }));

    return { isEmbedding };
};

export const useToggleLayergroups = () => {
    const { tempLayerAsLayerobj, prevLayerGroups, setToggleLayergroups } =
        useStore((store: AppStoreState) => ({
            tempLayerAsLayerobj: store.tempLayerAsLayerobj,
            prevLayerGroups: store.prevLayerGroups,
            setToggleLayergroups: store.toggleActiveLayerGroup,
        }));
    return { tempLayerAsLayerobj, prevLayerGroups, setToggleLayergroups };
};

export const useIsAddingLayers = () => {
    const { isAddingLayers, setIsAddingLayers } = useStore((store: AppStoreState) => ({
        isAddingLayers: store.mapView.isAddingLayers,
        setIsAddingLayers: store.setIsAddingLayers,
    }));

    return { isAddingLayers, setIsAddingLayers };
};

export const useMapState = () => {
    const { viewState, setViewState } = useStore(
        (store: AppStoreState) => ({
            viewState: store.mapView.viewState,
            setViewState: store.setViewState,
        }),
        shallow
    );
    return { viewState, setViewState };
};

export const useBasemap = () => {
    const { selectedBasemap, setBasemap } = useStore(
        (store: AppStoreState) => ({
            selectedBasemap: store.mapView.basemap,
            setBasemap: store.setBaseMap,
        }),
        shallow
    );

    return { selectedBasemap, setBasemap };
};

export const useInitialRender = () => {
    const { isInitialrender } = useStore(
        (store: AppStoreState) => ({
            isInitialrender: store.mapView.initialrender,
        }),
        shallow
    );

    return { isInitialrender };
};

export const useIsDrawing = () => {
    const { isDrawing, setIsDrawing } = useStore(
        (store: AppStoreState) => ({
            isDrawing: store.mapView.isDrawing,
            setIsDrawing: store.setIsDrawing,
        }),
        shallow
    );

    return { isDrawing, setIsDrawing };
};

export const useLabels = () => {
    const { selectedLabels, setLabels } = useStore(
        (store: AppStoreState) => ({
            selectedLabels: store.mapView.labels,
            setLabels: store.setLabels,
        }),
        shallow
    );

    return { selectedLabels, setLabels };
};

export const useBoundaries = () => {
    const { showBoundaries, setShowBoundaries } = useStore(
        (store: AppStoreState) => ({
            showBoundaries: store.mapView.boundaries,
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
        removeLayerFromLayerGroup,
        addLayerToLayerGroup,
        replaceLayersForLayerGroup,
    } = useStore((store: AppStoreState) => ({
        activeLayerGroups: store.mapView.activeLayerGroups,
        replaceLayersGroups: store.replaceLayerGroups,
        updateLayerGroup: store.updateLayerGroup,
        addLayerGroup: store.addLayerGroup,
        removeLayerGroup: store.removeLayerGroup,
        removeLayerFromLayerGroup: store.removeLayerFromLayerGroup,
        addLayerToLayerGroup: store.addLayerToLayerGroup,
        replaceLayersForLayerGroup: store.replaceLayersForLayerGroup,
    }));

    return {
        activeLayerGroups,
        replaceLayersGroups,
        updateLayerGroup,
        addLayerGroup,
        removeLayerGroup,
        removeLayerFromLayerGroup,
        addLayerToLayerGroup,
        replaceLayersForLayerGroup,
    };
};

export const useLayerStates = () => {
    const { currentLayers, updateLayerState } = useStore((store: AppStoreState) => ({
        currentLayers: store.mapView.layers,
        updateLayerState: store.updateLayerState,
    }));

    return { currentLayers, updateLayerState };
};

export const useBounds = () => {
    const { bounds, setBounds } = useStore((store: AppStoreState) => ({
        bounds: store.mapView.bounds,
        setBounds: store.setBounds,
    }));

    return { bounds, setBounds };
};

export const useStoreDirtyFields = () => {
    const { storeDirtyFields, setStoreDirtyFields } = useStore((store: AppStoreState) => ({
        storeDirtyFields: store.storeDirtyFields,
        setStoreDirtyFields: store.setStoreDirtyFields,
    }));

    return { storeDirtyFields, setStoreDirtyFields };
};
