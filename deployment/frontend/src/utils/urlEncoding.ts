import { LayerState, Layers, State } from '@/interfaces/state.interface'

export function decodeMapParam(map?: string): State['mapView'] | null {
    if (!map) return null
    const decoded = atob(map)
    const parsed: State['mapView'] = JSON.parse(decoded)
    return parsed
}

export function encodeMapParam(state: Omit<State, 'isDrawing'>): string {
    const json = JSON.stringify(state)
    const encoded = btoa(json)
    return encoded
}
