import { type State } from '@/interfaces/state.interface';

export function decodeMapParam(map?: string): State['mapView'] | null {
    if (!map) return null;
    const decoded = atob(map);
    const parsed = JSON.parse(decoded) as State['mapView'];
    return parsed;
}

export function encodeMapParam(state: Omit<State, 'isDrawing'>): string {
    const sorted = deepSortObject(state);
    const json = JSON.stringify(sorted);
    const encoded = btoa(json);
    return encoded;
}

function deepSortObject<T>(obj: T): T {
    // ensure object of same content is always encoded the same way
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (Array.isArray(obj)) {
        return (obj as unknown[]).map((el) => deepSortObject(el)) as T;
    }
    const sortedEntries = Object.entries(obj as Record<string, unknown>)
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
        .map(([key, val]): [string, unknown] => [key, deepSortObject(val)]);

    return Object.fromEntries(sortedEntries) as T;
}
