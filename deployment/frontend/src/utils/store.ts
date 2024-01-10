import {
    ActiveLayerGroup,
    Basemap,
    Labels,
    LayerState,
    Layers,
    State,
    Bounds,
} from '@/interfaces/state.interface'
import { useLayoutEffect } from 'react'
import { ViewState } from 'react-map-gl'
import create, { UseBoundStore } from 'zustand'
import createContext from 'zustand/context'
import { combine } from 'zustand/middleware'

let store: any

type InitialState = ReturnType<typeof getDefaultInitialState>
type UseStoreState = typeof initializeStore extends (
    ...args: never
) => UseBoundStore<infer T>
    ? T
    : never

const getDefaultInitialState = () => {
    const initialState: State = {
        vizIndex: 0,
        dataset: null,
        mapView: {
            isEmbedding: false,
            isAddingLayers: false,
            activeLayerGroups: [],
            basemap: 'dark',
            labels: 'light',
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
                options: {} as Record<string, unknown>,
            },
            isDrawing: undefined,
        },
    }
    return initialState
}

const zustandContext = createContext<UseStoreState>()
export const Provider = zustandContext.Provider
export const useStore = zustandContext.useStore

export const initializeStore = (preloadedState: any = {}) => {
    return create(
        combine(
            {
                ...getDefaultInitialState(),
                ...preloadedState,
                mapView: {
                    ...getDefaultInitialState().mapView,
                    ...preloadedState?.mapView,
                },
            },
            (set, get) => ({
                setVizIndex: (vizIndex: number) => {
                    const prev = get()
                    set({ ...prev, vizIndex })
                },
                setThreshold: (threshold: number) => {
                    const prev = get()
                    set({ ...prev, mapView: { ...prev.mapView, threshold } })
                },
                setIsEmbedding: (isEmbedding: boolean) => {
                    const prev = get()
                    set({
                        ...prev,
                        mapView: {
                            ...prev.mapView,
                            isEmbedding,
                        },
                    })
                },
                setIsAddingLayers: (isAddingLayers: boolean) => {
                    const prev = get()
                    set({
                        mapView: {
                            ...prev.mapView,
                            isAddingLayers,
                        },
                    })
                },
                setViewState: (newViewState: ViewState) => {
                    const prev = get()
                    set({
                        mapView: {
                            ...prev.mapView,
                            viewState: newViewState,
                        },
                    })
                },
                setBaseMap: (newBasemap: Basemap) => {
                    const prev = get()
                    set({
                        mapView: {
                            ...prev.mapView,
                            basemap: newBasemap,
                        },
                    })
                },
                setBounds: (newBounds: Bounds) => {
                    const prev = get()
                    set({
                        mapView: {
                            ...prev.mapView,
                            bounds: newBounds,
                        },
                    })
                },
                setLabels: (newLabels: Labels) => {
                    const prev = get()
                    set({
                        mapView: {
                            ...prev.mapView,
                            labels: newLabels,
                        },
                    })
                },
                setBoundaries: (newBoundaries: boolean) => {
                    const prev = get()
                    set({
                        mapView: {
                            ...prev.mapView,
                            boundaries: newBoundaries,
                        },
                    })
                },
                setIsDrawing: (newIsDrawing?: boolean) => {
                    const prev = get()
                    set({
                        mapView: {
                            ...prev.mapView,
                            isDrawing: newIsDrawing,
                        },
                    })
                },
                replaceLayerGroups: (layerGroups: ActiveLayerGroup[]) => {
                    const prev = get()
                    set({
                        mapView: {
                            ...prev.mapView,
                            activeLayerGroups: layerGroups,
                        },
                    })
                },
                updateLayerGroup: (
                    datasetId: string,
                    layers: ActiveLayerGroup
                ) => {
                    const activeLayerGroups = get().mapView.activeLayerGroups

                    const layerGroupIndex = activeLayerGroups.findIndex(
                        (lg: any) => lg.datasetId == datasetId
                    )

                    if (layerGroupIndex != -1) {
                        // @ts-ignore
                        activeLayerGroups[layerGroupIndex].layers = layers
                    }

                    const prev = get()
                    set({
                        ...prev,
                        mapView: {
                            ...prev.mapView,
                            activeLayerGroups: activeLayerGroups,
                        },
                    })
                },
                addLayerGroup: (layerGroup: ActiveLayerGroup) => {
                    const activeLayerGroups = get().mapView.activeLayerGroups
                    const prev = get()
                    set({
                        ...prev,
                        mapView: {
                            ...prev.mapView,
                            activeLayerGroups: [
                                layerGroup,
                                ...activeLayerGroups,
                            ],
                        },
                    })
                },
                removeLayerGroup: (layerGroup: ActiveLayerGroup) => {
                    const activeLayerGroups = get().mapView.activeLayerGroups
                    const prev = get()
                    set({
                        ...prev,
                        mapView: {
                            ...prev.mapView,
                            activeLayerGroups: activeLayerGroups.filter(
                                (d: any) =>
                                    JSON.stringify(d) !==
                                    JSON.stringify(layerGroup)
                            ),
                        },
                    })
                },
                removeLayerFromLayerGroup: (
                    layerId: string,
                    datasetId: string
                ) => {
                    const prev = get()
                    const activeLayerGroups = get().mapView.activeLayerGroups
                    let newActiveLayerGroups =
                        structuredClone(activeLayerGroups)
                    const layerGroup = newActiveLayerGroups.find(
                        (lg: ActiveLayerGroup) => lg.datasetId == datasetId
                    )

                    if (layerGroup) {
                        layerGroup.layers = layerGroup.layers.filter(
                            (l: string) => l != layerId
                        )

                        if (!layerGroup.layers?.length) {
                            newActiveLayerGroups = newActiveLayerGroups.filter(
                                (lg: ActiveLayerGroup) =>
                                    lg.datasetId != datasetId
                            )
                        }
                    }

                    set({
                        ...prev,
                        mapView: {
                            ...prev.mapView,
                            activeLayerGroups: newActiveLayerGroups || [],
                        },
                    })
                },
                addLayerToLayerGroup: (layerId: string, datasetId: string) => {
                    const prev = get()
                    const activeLayerGroups = get().mapView.activeLayerGroups
                    const newActiveLayerGroups =
                        structuredClone(activeLayerGroups)

                    const lg = newActiveLayerGroups.find(
                        (lg: any) => lg.datasetId == datasetId
                    )

                    if (lg) {
                        lg.layers = [...(lg.layers || []), layerId]
                    } else {
                        newActiveLayerGroups.push({
                            datasetId,
                            layers: [layerId],
                        })
                    }

                    set({
                        ...prev,
                        mapView: {
                            ...prev.mapView,
                            activeLayerGroups: newActiveLayerGroups || [],
                        },
                    })
                },
                replaceLayersForLayerGroup: (
                    layerIds: string[],
                    datasetId: string
                ) => {
                    const prev = get()
                    const activeLayerGroups = get().mapView.activeLayerGroups
                    let newActiveLayerGroups =
                        structuredClone(activeLayerGroups)

                    const lg = newActiveLayerGroups.find(
                        (lg: any) => lg.datasetId == datasetId
                    )

                    if (lg && layerIds?.length) {
                        lg.layers = layerIds
                    } else if (layerIds?.length) {
                        newActiveLayerGroups.push({
                            datasetId,
                            layers: layerIds,
                        })
                    } else {
                        console.log(newActiveLayerGroups)
                        newActiveLayerGroups = newActiveLayerGroups.filter(
                            (lg: ActiveLayerGroup) => lg.datasetId != datasetId
                        )
                    }

                    set({
                        ...prev,
                        mapView: {
                            ...prev.mapView,
                            activeLayerGroups: newActiveLayerGroups || [],
                        },
                    })
                },
                updateLayerState: (
                    layerId: string,
                    keyName: string,
                    newValue: number | boolean
                ) => {
                    const currentLayers = get().mapView.layers
                    if (!currentLayers.has(layerId))
                        currentLayers.set(layerId, {})
                    const currentLayer = currentLayers.get(layerId)
                    currentLayers.set(layerId, {
                        ...currentLayer,
                        [keyName]: newValue,
                    } as LayerState)
                    const prev = get()
                    set({
                        ...prev,
                        mapView: {
                            ...prev.mapView,
                            layers: currentLayers,
                        },
                    })
                },
            })
        )
    )
}

export const useCreateStore = (serverInitialState: Partial<InitialState>) => {
    // For SSR & SSG, always use a new store.
    if (typeof window === 'undefined') {
        return () => initializeStore(serverInitialState)
    }

    const isReusingStore = Boolean(store)
    // For CSR, always re-use same store.
    store = store ?? initializeStore(serverInitialState)
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
            )
        }
    })

    return () => store
}
