import {Basemap} from "@/interfaces/state.interface"
import {useBasemap} from "@/utils/storeHooks"
import {MutableRefObject, useCallback, useEffect} from "react"
import { type Map as MapType } from 'mapbox-gl'
import {MapRef} from "react-map-gl"

export default function Basemap({mapRef}: {mapRef: MutableRefObject<MapRef | null>}) {
    const { selectedBasemap } = useBasemap()

    const handleBasemap = useCallback(
        (basemap: Basemap) => {
            // This function takes a 'basemap' as input and handles the logic to change the basemap for the custom map style.
            const map = mapRef.current as unknown as MapType
            if (!map) return
            // Destructuring assignment to get the 'map' object from 'mapRef' using useRef hook.
            const BASEMAP_GROUPS = ['basemap'] // An array containing the group names of basemap layers.
            const { layers, metadata } = (map as MapType).getStyle() // Extracting the layers and metadata from the current map style.

            // Extracting the basemap groups from the metadata.
            const basemapGroups = Object.keys(metadata['mapbox:groups']).filter(
                (k) => {
                    const { name } = metadata['mapbox:groups'][k]

                    // Mapping over the BASEMAP_GROUPS array to check if 'name' contains any of the basemap group names.
                    const matchedGroups = BASEMAP_GROUPS.map((rgr) =>
                        name.toLowerCase().includes(rgr)
                    )

                    // Checking if any of the 'matchedGroups' array elements are true (i.e., if any basemap group name was found).
                    return matchedGroups.some((bool) => bool)
                }
            )

            // Mapping over the 'basemapGroups' array to get basemaps with additional metadata.
            const basemapsWithMeta = basemapGroups.map((groupId) => ({
                ...metadata['mapbox:groups'][groupId],
                id: groupId,
            }))

            // Finding the basemap to display based on the input 'basemap'.
            const basemapToDisplay = basemapsWithMeta.find((_basemap) =>
                _basemap.name.includes(basemap)
            )

            // Filtering layers based on whether they belong to any of the basemap groups.
            const basemapLayers = layers.filter((l: mapboxgl.Layer) => {
                const layerMetadata = l.metadata ? l.metadata : undefined
                if (!layerMetadata) return false

                // Getting the 'mapbox:group' from layer metadata.
                const gr = layerMetadata['mapbox:group']

                // Checking if the 'gr' (group name) is present in 'basemapGroups'.
                return basemapGroups.includes(gr)
            })

            // Looping through the 'basemapLayers' to set the visibility of each layer based on the selected 'basemap'.
            basemapLayers.forEach((_layer: mapboxgl.Layer) => {
                const match =
                    _layer.metadata['mapbox:group'] === basemapToDisplay.id
                if (!match) {
                    // Setting the visibility of the layer to 'none' if it does not match the selected 'basemap'.
                    ;(map as MapType).setLayoutProperty(
                        _layer.id,
                        'visibility',
                        'none'
                    )
                } else {
                    // Setting the visibility of the layer to 'visible' if it matches the selected 'basemap'.
                    ;(map as MapType).setLayoutProperty(
                        _layer.id,
                        'visibility',
                        'visible'
                    )
                }
            })
        },
        [mapRef]
    )

    useEffect(() => {
        handleBasemap(selectedBasemap as Basemap)
    }, [selectedBasemap, handleBasemap])



    return null
}
