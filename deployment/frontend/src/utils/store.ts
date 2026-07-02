import { type View } from '@/interfaces/dataset.interface';
import {
    type ActiveLayerGroup,
    type Basemap,
    type Labels,
    type LayerState,
    type State,
    type Bounds,
} from '@/interfaces/state.interface';
import { useLayoutEffect } from 'react';
import { type ViewState } from 'react-map-gl';
import { create } from 'zustand';
import { createContext } from 'zustand-utils';
import { combine } from 'zustand/middleware';

type InitialState = ReturnType<typeof getDefaultInitialState>;

const getDefaultInitialState = () => {
    const initialState: State = {
        vizIndex: 0,
        dataset: null,
        relatedDatasets: null,
        storeDirtyFields: [],
        prevRelatedDatasets: null,
        layerAsLayerObj: new Map(),
        tempLayerAsLayerobj: new Map(),
        prevLayerGroups: [],
        mapView: {
            initialrender: false,
            isEmbedding: false,
            isAddingLayers: false,
            activeLayerGroups: [],
            basemap: 'light',
            labels: 'dark',
            boundaries: false,
            layersParsed: [],
            layers: new Map<string, LayerState>(),
            viewState: {
                latitude: 0,
                longitude: 0,
                zoom: 6,
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
        },
        activeCharts: [],
        selectedChart: undefined,
    };
    return initialState;
};

export const initializeStore = (preloadedState: Partial<InitialState> = {}) => {
    // console.log('Initializing store with preloaded state', preloadedState);
    // console.log('Default initial state', getDefaultInitialState());
    const initialState: InitialState = {
        ...getDefaultInitialState(),
        ...preloadedState,
        mapView: {
            ...getDefaultInitialState().mapView,
            ...preloadedState?.mapView,
            viewState: {
                ...getDefaultInitialState().mapView.viewState,
                ...preloadedState?.mapView?.viewState,
            },
        },
    };

    return create(
        combine(
            initialState,
            (set, get) => ({
                setStoreDirtyFields: (storeDirtyFieldsFunc: () => string[]) => {
                    const storeDirtyFields = storeDirtyFieldsFunc();
                    const prev = get();
                    set({ ...prev, storeDirtyFields });
                },
                setVizIndex: (vizIndex: number) => {
                    const prev = get();
                    set({ ...prev, vizIndex });
                },
                setThreshold: (threshold: number) => {
                    const prev = get();
                    set({ ...prev, mapView: { ...prev.mapView, threshold } });
                },
                setIsEmbedding: (isEmbedding: boolean) => {
                    const prev = get();
                    set({
                        ...prev,
                        mapView: {
                            ...prev.mapView,
                            isEmbedding,
                        },
                    });
                },
                setIsAddingLayers: (isAddingLayers: boolean) => {
                    const prev = get();
                    set({
                        mapView: {
                            ...prev.mapView,
                            isAddingLayers,
                        },
                    });
                },
                setViewState: (newViewState: ViewState) => {
                    const prev = get();
                    set({
                        mapView: {
                            ...prev.mapView,
                            viewState: newViewState,
                        },
                    });
                },
                setBaseMap: (newBasemap: Basemap) => {
                    const prev = get();
                    set({
                        mapView: {
                            ...prev.mapView,
                            basemap: newBasemap,
                        },
                    });
                },
                setBounds: (newBounds: Bounds) => {
                    const prev = get();
                    set({
                        mapView: {
                            ...prev.mapView,
                            bounds: newBounds,
                        },
                    });
                },
                setLabels: (newLabels: Labels) => {
                    const prev = get();
                    set({
                        mapView: {
                            ...prev.mapView,
                            labels: newLabels,
                        },
                    });
                },
                setBoundaries: (newBoundaries: boolean) => {
                    const prev = get();
                    set({
                        mapView: {
                            ...prev.mapView,
                            boundaries: newBoundaries,
                        },
                    });
                },
                setIsDrawing: (newIsDrawing?: boolean) => {
                    const prev = get();
                    set({
                        mapView: {
                            ...prev.mapView,
                            isDrawing: newIsDrawing,
                        },
                    });
                },
                replaceLayerGroups: (layerGroups: ActiveLayerGroup[]) => {
                    const prev = get();
                    set({
                        mapView: {
                            ...prev.mapView,
                            activeLayerGroups: layerGroups,
                        },
                    });
                },
                updateLayerGroup: (
                    datasetId: string,
                    layers: ActiveLayerGroup
                ) => {
                    const activeLayerGroups = get().mapView.activeLayerGroups;

                    const layerGroupIndex = activeLayerGroups.findIndex(
                        (lg: any) => lg.datasetId == datasetId
                    );

                    if (layerGroupIndex != -1) {
                        // @ts-ignore
                        activeLayerGroups[layerGroupIndex].layers = layers;
                    }

                    const prev = get();
                    set({
                        ...prev,
                        mapView: {
                            ...prev.mapView,
                            activeLayerGroups: activeLayerGroups,
                        },
                    });
                },
                addLayerGroup: (layerGroup: ActiveLayerGroup) => {
                    const activeLayerGroups = get().mapView.activeLayerGroups;
                    const prev = get();
                    set({
                        ...prev,
                        mapView: {
                            ...prev.mapView,
                            activeLayerGroups: [
                                layerGroup,
                                ...activeLayerGroups,
                            ],
                        },
                    });
                },
                removeLayerGroup: (layerGroup: ActiveLayerGroup) => {
                    const activeLayerGroups = get().mapView.activeLayerGroups;
                    const prev = get();
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
                    });
                },
                toggleActiveLayerGroup: (
                    prevLayerGroups: ActiveLayerGroup[],
                    tempLayerAsLayerobj: Map<string, string>
                ) => {
                    let activeLayerGroups = get().mapView.activeLayerGroups;
                    const prev = get();
                    let layerAsLayerObj = prev.layerAsLayerObj;

                    const temp = structuredClone(activeLayerGroups);
                    const temp2 = new Map<string, string>([...layerAsLayerObj]);
                    activeLayerGroups = structuredClone(prevLayerGroups);
                    prevLayerGroups = structuredClone(temp);
                    layerAsLayerObj = new Map(tempLayerAsLayerobj);
                    tempLayerAsLayerobj = new Map([...temp2]);

                    // switch prevRelatedDatasets and relatedDatasets
                    let prevRelatedDatasets = prev.prevRelatedDatasets;
                    let relatedDatasets = prev.relatedDatasets;

                    const tempRelatedDataset =
                        structuredClone(prevRelatedDatasets);
                    prevRelatedDatasets = structuredClone(relatedDatasets);
                    relatedDatasets = structuredClone(tempRelatedDataset);

                    set({
                        ...prev,
                        tempLayerAsLayerobj: tempLayerAsLayerobj,
                        layerAsLayerObj: layerAsLayerObj,
                        prevLayerGroups: prevLayerGroups,
                        prevRelatedDatasets: prevRelatedDatasets,
                        relatedDatasets: relatedDatasets,
                        mapView: {
                            ...prev.mapView,
                            activeLayerGroups: activeLayerGroups,
                        },
                    });
                },
                removeLayerFromLayerGroup: (
                    layerId: string,
                    datasetId: string
                ) => {
                    const prev = get();
                    const activeLayerGroups = get().mapView.activeLayerGroups;
                    let newActiveLayerGroups =
                        structuredClone(activeLayerGroups);
                    const layerGroup = newActiveLayerGroups.find(
                        (lg: ActiveLayerGroup) => lg.datasetId == datasetId
                    );

                    if (layerGroup) {
                        layerGroup.layers = layerGroup.layers.filter(
                            (l: string) => l != layerId
                        );

                        if (!layerGroup.layers?.length) {
                            newActiveLayerGroups = newActiveLayerGroups.filter(
                                (lg: ActiveLayerGroup) =>
                                    lg.datasetId != datasetId
                            );
                        }
                    }

                    set({
                        ...prev,
                        mapView: {
                            ...prev.mapView,
                            activeLayerGroups: newActiveLayerGroups || [],
                        },
                    });
                },
                addLayerToLayerGroup: (
                    layerId: string,
                    datasetId: string,
                    layerSource?: string,
                    first?: boolean
                ) => {
                    const prev = get();
                    const activeLayerGroups = get().mapView.activeLayerGroups;
                    const newActiveLayerGroups =
                        structuredClone(activeLayerGroups);
                    const initialrender = first || false;
                    const lg = newActiveLayerGroups.find(
                        (lg: any) => lg.datasetId == datasetId
                    );

                    if (lg) {
                        lg.layers = [...(lg.layers || []), layerId];
                    } else {
                        newActiveLayerGroups.push({
                            datasetId,
                            layers: [layerId],
                        });
                    }
                    //set default view state
                    const currentLayers = get().mapView.layers;
                    currentLayers.set(layerId, {
                        visibility: true,
                        active: true,
                        opacity: 1,
                        layerSource: layerSource ? layerSource : null,
                        zIndex: Object.keys(currentLayers).length + 11,
                    });

                    set({
                        ...prev,
                        mapView: {
                            ...prev.mapView,
                            activeLayerGroups: newActiveLayerGroups || [],
                            initialrender: initialrender,
                        },
                    });
                },
                replaceLayersForLayerGroup: (
                    layerIds: string[],
                    datasetId: string
                ) => {
                    const prev = get();
                    const activeLayerGroups = get().mapView.activeLayerGroups;
                    let newActiveLayerGroups =
                        structuredClone(activeLayerGroups);

                    const lg = newActiveLayerGroups.find(
                        (lg: any) => lg.datasetId == datasetId
                    );

                    if (lg && layerIds?.length) {
                        lg.layers = layerIds;
                    } else if (layerIds?.length) {
                        newActiveLayerGroups.push({
                            datasetId,
                            layers: layerIds,
                        });
                    } else {
                        newActiveLayerGroups = newActiveLayerGroups.filter(
                            (lg: ActiveLayerGroup) => lg.datasetId != datasetId
                        );
                    }
                    //set default view state
                    const currentLayers = get().mapView.layers;
                    layerIds.forEach((_id: string, index: number) => {
                        currentLayers.set(_id, {
                            visibility: index === 0,
                            active: index === 0,
                            opacity: 1,
                            zIndex:
                                Object.keys(currentLayers).length + 11 + index,
                        });
                    });

                    set({
                        ...prev,
                        mapView: {
                            ...prev.mapView,
                            activeLayerGroups: newActiveLayerGroups || [],
                        },
                    });
                },
                updateLayerState: (
                    layerId: string,
                    keyName: string,
                    newValue: number | boolean
                ) => {
                    const currentLayers = get().mapView.layers;
                    if (!currentLayers.has(layerId))
                        currentLayers.set(layerId, {});
                    const currentLayer = currentLayers.get(layerId);
                    currentLayers.set(layerId, {
                        ...currentLayer,
                        [keyName]: newValue,
                    });
                    const prev = get();
                    set({
                        ...prev,
                        mapView: {
                            ...prev.mapView,
                            layers: currentLayers,
                        },
                    });
                },
                addCharts: (views: View[]) => {
                    const prev = get();
                    set({
                        ...prev,
                        activeCharts: [...prev.activeCharts, ...views],
                    });
                },
                removeCharts: (chartIds: string[]) => {
                    const prev = get();
                    set({
                        activeCharts: [
                            ...prev.activeCharts.filter(
                                (c: View) => !chartIds.includes(c.id ?? '')
                            ),
                        ],
                    });
                },
                selectChart: (view: View | null) => {
                    set({
                        selectedChart: view,
                    });
                },
            })
        )
    );
};

export type AppStore = ReturnType<typeof initializeStore>;
export type AppStoreState = InitialState & Omit<
    ReturnType<AppStore['getState']>,
    keyof InitialState
>;

let store: AppStore | undefined;

const zustandContext = createContext<AppStore>();
export const Provider = zustandContext.Provider;

const contextUseStore = zustandContext.useStore;

export function useStore<T>(
    selector: (state: AppStoreState) => T,
    equalityFn?: (a: T, b: T) => boolean
): T {
    return contextUseStore(selector, equalityFn);
}

export const useCreateStore = (serverInitialState: Partial<InitialState>) => {
    // For SSR & SSG, always use a new store.
    if (typeof window === 'undefined') {
        return () => initializeStore(serverInitialState);
    }

    const isReusingStore = Boolean(store);
    // For CSR, always re-use same store.
    const currentStore = store ?? initializeStore(serverInitialState);
    store = currentStore;
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
            currentStore.setState(
                {
                    // re-use functions from existing store
                    ...currentStore.getState(),
                    // but reset all other properties.
                    ...serverInitialState,
                },
                true // replace states, rather than shallow merging
            );
        }
    });

    return () => currentStore;
};
