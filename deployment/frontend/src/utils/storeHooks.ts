import { shallow } from 'zustand/shallow'
import { useStore } from './store'

export const useVizIndex = () => {
    const { vizIndex, setVizIndex } = useStore((store) => ({
        vizIndex: store.vizIndex,
        setVizIndex: store.setVizIndex,
    }))
    return { vizIndex, setVizIndex }
}

export const useDataset = () => {
    const { dataset } = useStore((store) => ({ dataset: store.dataset }))

    return { dataset }
}

export const useRelatedDatasets = () => {
    const { relatedDatasets } = useStore((store) => ({
        relatedDatasets: store.relatedDatasets,
    }))

    return { relatedDatasets }
}

export const useIsEmbeddingMap = () => {
    const { isEmbedding } = useStore((store) => ({
        isEmbedding: store.mapView.isEmbedding,
    }))

    return { isEmbedding }
}

export const useIsAddingLayers = () => {
    const { isAddingLayers, setIsAddingLayers } = useStore((store) => ({
        isAddingLayers: store.mapView.isAddingLayers,
        setIsAddingLayers: store.setIsAddingLayers,
    }))

    return { isAddingLayers, setIsAddingLayers }
}

export const useMapState = () => {
    const { viewState, setViewState } = useStore(
        (store) => ({
            viewState: store.mapView.viewState,
            setViewState: store.setViewState,
        }),
        shallow
    )

    return { viewState, setViewState }
}

export const useBasemap = () => {
    const { selectedBasemap, setBasemap } = useStore(
        (store) => ({
            selectedBasemap: store.mapView.basemap,
            setBasemap: store.setBaseMap,
        }),
        shallow
    )

    return { selectedBasemap, setBasemap }
}

export const useIsDrawing = () => {
    const { isDrawing, setIsDrawing } = useStore(
        (store) => ({
            isDrawing: store.mapView.isDrawing,
            setIsDrawing: store.setIsDrawing,
        }),
        shallow
    )

    return { isDrawing, setIsDrawing }
}

export const useLabels = () => {
    const { selectedLabels, setLabels } = useStore(
        (store) => ({
            selectedLabels: store.mapView.labels,
            setLabels: store.setLabels,
        }),
        shallow
    )

    return { selectedLabels, setLabels }
}

export const useBoundaries = () => {
    const { showBoundaries, setShowBoundaries } = useStore(
        (store) => ({
            showBoundaries: store.mapView.boundaries,
            setShowBoundaries: store.setBoundaries,
        }),
        shallow
    )

    return { showBoundaries, setShowBoundaries }
}

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
    } = useStore((store) => ({
        activeLayerGroups: store.mapView.activeLayerGroups,
        replaceLayersGroups: store.replaceLayerGroups,
        updateLayerGroup: store.updateLayerGroup,
        addLayerGroup: store.addLayerGroup,
        removeLayerGroup: store.removeLayerGroup,
        removeLayerFromLayerGroup: store.removeLayerFromLayerGroup,
        addLayerToLayerGroup: store.addLayerToLayerGroup,
        replaceLayersForLayerGroup: store.replaceLayersForLayerGroup,
    }))

    return {
        activeLayerGroups,
        replaceLayersGroups,
        updateLayerGroup,
        addLayerGroup,
        removeLayerGroup,
        removeLayerFromLayerGroup,
        addLayerToLayerGroup,
        replaceLayersForLayerGroup,
    }
}

export const useLayerStates = () => {
    const { currentLayers, updateLayerState } = useStore((store) => ({
        currentLayers: store.mapView.layers,
        updateLayerState: store.updateLayerState,
    }))

    return { currentLayers, updateLayerState }
}

export const useBounds = () => {
    const { bounds, setBounds } = useStore((store) => ({
        bounds: store.mapView.bounds,
        setBounds: store.setBounds,
    }))

    return { bounds, setBounds }
}
