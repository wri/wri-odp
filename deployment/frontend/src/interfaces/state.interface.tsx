import { WriDataset } from '@/schema/ckan.schema'
import { ViewState } from 'react-map-gl'
import { View } from './dataset.interface'

export interface State {
    vizIndex: number
    dataset: WriDataset | null
    relatedDatasets: WriDataset[] | null
    prevRelatedDatasets: WriDataset[] | null
    layerAsLayerObj: Map<string, string>
    tempLayerAsLayerobj: Map<string, string>
    prevLayerGroups: ActiveLayerGroup[]
    storeDirtyFields: string[]
    mapView: {
        isEmbedding: boolean
        isAddingLayers?: boolean
        viewState: ViewState
        basemap: Basemap
        labels: Labels
        boundaries: boolean
        activeLayerGroups: ActiveLayerGroup[]
        bounds: Bounds
        isDrawing: boolean | undefined
        layersParsed: Array<[string, LayerState]>
    } & Layers
    activeCharts: View[]
    selectedChart?: View
}

export interface ActiveLayerGroup {
    datasetId: string
    layers: string[]
}

export type Basemap =
    | 'dark'
    | 'light'
    | 'satellite'
    | 'terrain'
    | 'aqueduct'
    | 'none'

export interface DatasetState {
    id: string
    layers: LayerState[]
}

export interface Layers {
    layers: Map<string, LayerState>
}

export interface LayerState {
    visibility?: boolean
    active?: boolean
    zIndex?: number
    opacity?: number
    threshold?: number
}

export type Labels = 'dark' | 'light' | 'none'

export interface Bounds {
    bbox: number[] | null
    options?: Record<string, unknown>
    viewportOptions?: Partial<ViewState>
}
