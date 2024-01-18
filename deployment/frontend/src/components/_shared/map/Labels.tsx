import { Labels } from '@/interfaces/state.interface'
import { MutableRefObject, useCallback, useEffect } from 'react'
import { MapRef } from 'react-map-gl'
import mapboxgl, { Map as MapType } from 'mapbox-gl'
import { useLabels } from '@/utils/storeHooks'

export default function Labels({
    mapRef,
}: {
    mapRef: MutableRefObject<MapRef | null>
}) {
    const { selectedLabels } = useLabels()

    const handleLabels = useCallback(
        (labels: Labels) => {
            const map = mapRef.current as unknown as MapType
            const LABELS_GROUP = ['labels']
            const { layers, metadata } = (map as MapType).getStyle()

            const labelGroups = Object.keys(metadata['mapbox:groups']).filter(
                (k) => {
                    const { name } = metadata['mapbox:groups'][k]

                    const matchedGroups = LABELS_GROUP.filter((rgr) =>
                        name.toLowerCase().includes(rgr)
                    )

                    return matchedGroups.some((bool) => bool)
                }
            )

            const labelsWithMeta = labelGroups.map((_groupId) => ({
                ...metadata['mapbox:groups'][_groupId],
                id: _groupId,
            }))
            const labelsToDisplay =
                labelsWithMeta.find((_basemap) =>
                    _basemap.name.includes(labels)
                ) || {}

            const labelLayers = layers.filter((l: mapboxgl.Layer) => {
                const { metadata: layerMetadata } = l
                if (!layerMetadata) return false

                const gr = layerMetadata['mapbox:group']
                return labelGroups.includes(gr)
            })

            labelLayers.forEach((_layer: mapboxgl.Layer) => {
                const match =
                    _layer.metadata['mapbox:group'] === labelsToDisplay.id
                ;(map as MapType).setLayoutProperty(
                    _layer.id,
                    'visibility',
                    match ? 'visible' : 'none'
                )
            })
        },
        [mapRef]
    )

    useEffect(() => {
        handleLabels(selectedLabels)
    }, [selectedLabels, handleLabels])

    return null
}


