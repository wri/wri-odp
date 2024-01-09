import { WriDataset } from '@/schema/ckan.schema'
import { ViewState } from 'react-map-gl'

export interface State {
    dataset: WriDataset | null
    relatedDatasets: WriDataset[] | null,
    mapView: {
        isEmbedding: boolean,
        isAddingLayers?: boolean,
        viewState: ViewState
        basemap: Basemap
        labels: Labels
        boundaries: boolean
        activeLayerGroups: ActiveLayerGroup[]
        bounds: Bounds
        isDrawing: boolean | undefined
        layersParsed: Array<[string, LayerState]>
    } & Layers
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
