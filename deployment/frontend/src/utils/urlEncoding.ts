import { LayerState, Layers, type State } from '@/interfaces/state.interface'

export function decodeMapParam(map?: string): State['mapView'] | null {
    if (!map) return null
    const decoded = atob(map)
    const parsed: State['mapView'] = JSON.parse(decoded)
    return parsed
}

export function encodeMapParam(state: Omit<State, 'isDrawing'>): string {
    const sorted = deepSortObject(state)
    const json = JSON.stringify(sorted)
    const encoded = btoa(json)
    return encoded
}

function deepSortObject<T>(obj: T): T {
    // ensure object of same content is always encoded the same way
    if (obj === null || typeof obj !== 'object') {
        return obj
    }
    if (Array.isArray(obj)) {
        return obj.map((el) => deepSortObject(el)) as unknown as T
    }
    const sortedEntries = (Object.entries(obj))
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
        .map(([key, val]) => [key, deepSortObject(val)])

    return Object.fromEntries(sortedEntries) as T
}
