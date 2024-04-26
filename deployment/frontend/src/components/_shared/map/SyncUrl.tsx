import {
    useActiveLayerGroups,
    useBasemap,
    useBoundaries,
    useLabels,
    useLayerStates,
    useMapState,
    useBounds,
} from '@/utils/storeHooks'
import { encodeMapParam } from '@/utils/urlEncoding'
import { useEffect } from 'react'
import { useDebounce } from 'usehooks-ts'
import { env } from '@/env.mjs'

export default function SyncUrl() {
    const { viewState } = useMapState()
    const { selectedBasemap } = useBasemap()
    const { showBoundaries } = useBoundaries()
    const { selectedLabels } = useLabels()
    const { activeLayerGroups } = useActiveLayerGroups()
    const { bounds } = useBounds()
    const { currentLayers } = useLayerStates()
    const debouncedValue = useDebounce(
        {
            viewState,
            currentLayers,
            activeLayerGroups,
            selectedLabels,
            showBoundaries,
            selectedBasemap,
            bounds,
        },
        500
    )

    const debouneMapTrackValue = useDebounce(
        {
            zoom: debouncedValue.viewState.zoom,
            latitude: debouncedValue.viewState.latitude,
            longitude: debouncedValue.viewState.longitude,
            layer:
                activeLayerGroups.length > 0 ? activeLayerGroups[0].layers : [],
        },
        1500
    )

    useEffect(() => {
        if (debouneMapTrackValue && typeof window !== 'undefined') {
            if (env.NEXT_PUBLIC_DISABLE_HOTJAR !== 'disabled') {
                //@ts-ignore
                dataLayer.push({
                    event: 'map_events',
                    lat_coord: debouneMapTrackValue.latitude + '',
                    long_coord: debouneMapTrackValue.longitude + '',
                    zoom_level: debouneMapTrackValue.zoom + '',
                    layer: debouneMapTrackValue.layer.join(','),
                })
            }
        }
    }, [debouneMapTrackValue])

    useEffect(() => {
        if (debouncedValue && typeof window !== 'undefined') {
            const map = encodeMapParam({
                // @ts-ignore
                viewState: debouncedValue.viewState,
                basemap: selectedBasemap,
                boundaries: showBoundaries,
                labels: selectedLabels,
                activeLayerGroups,
                bounds,
                layersParsed: Array.from(
                    currentLayers ? currentLayers.entries() : []
                ),
            })

            updateURLParameter(window.location.href, 'map', map)
        }
    }, [
        debouncedValue,
        selectedBasemap,
        showBoundaries,
        selectedLabels,
        activeLayerGroups,
        bounds,
        currentLayers,
    ])
    return null
}

function updateURLParameter(
    url: string,
    paramName: string,
    paramValue: string
) {
    const urlObj = new URL(url)
    const searchParams = urlObj.searchParams
    searchParams.set(paramName, paramValue)

    // Get the URL without the query string
    const baseUrl = url.split('?')[0]

    // Create a new URL with updated parameters
    const newUrl = baseUrl + '?' + searchParams.toString()

    // Update the URL without triggering history change
    window.history.replaceState({ path: newUrl }, '', newUrl)
}
