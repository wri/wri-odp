import React, {
    useState,
    useRef,
    useCallback,
    MutableRefObject,
    useEffect,
} from 'react'
// import Geosuggest, { Suggest } from 'react-geosuggest';
import { fitBounds } from '@math.gl/web-mercator'
import { useDebouncedCallback } from 'use-debounce'
import { useMapState, useBounds } from '@/utils/storeHooks'
import isEmpty from 'lodash/isEmpty'
import IconButton from './IconButton'
import { SearchIcon } from '../../icons/SearchIcon'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import classNames from '@/utils/classnames'

export default function Search({
    mapContainerRef,
}: {
    mapContainerRef: MutableRefObject<HTMLDivElement | null>
}) {
    const [showSearchInput, setShowSearchInput] = useState(false)
    const firstRender = useRef(true)
    const { setViewState, viewState } = useMapState()
    const { bounds, setBounds } = useBounds()

    useEffect(() => {
        if (firstRender.current) {
            const geocoder = new MapboxGeocoder({
                marker: false,
                accessToken:
                    'pk.eyJ1IjoicmVzb3VyY2V3YXRjaCIsImEiOiJjajFlcXZhNzcwMDBqMzNzMTQ0bDN6Y3U4In0.FRcIP_yusVaAy0mwAX1B8w',
                types: 'country,region,place,locality',
            })

            geocoder.on('result', (r) => {
                geocoder.clear()
                handleSearchInput(false)
                handleSearch(r)
            })

            geocoder.addTo('#search-location-map')

            firstRender.current = false
        }
    }, [])

    const debouncedOnMapViewportChange = useDebouncedCallback((v) => {
        setViewState(v)
    }, 250)

    const handleSearch = useCallback(
        (locationParams: any) => {
            setBounds({
                bbox: locationParams.result.bbox,
                options: { zoom: 2 },
            })
        },
        [setBounds]
    )

    const handleFitBounds = useCallback(() => {
        const bbox = bounds.bbox as number[]
        const options = bounds.options
        const mapContainer = mapContainerRef.current as HTMLDivElement
        if (mapContainer.offsetWidth <= 0 || mapContainer.offsetHeight <= 0) {
            throw new Error("mapContainerRef doesn't have any dimensions")
        }

        const { longitude, latitude, zoom } = fitBounds({
            width: mapContainer.offsetWidth,
            height: mapContainer.offsetHeight,
            bounds: [
                //@ts-ignore
                [bbox[0], bbox[1]],
                //@ts-ignore
                [bbox[2], bbox[3]],
            ],
            ...options,
        })

        const newViewport = {
            longitude,
            latitude,
            zoom,
        }

        const viewport = { ...viewState, ...newViewport }
        setViewState(viewport)
        debouncedOnMapViewportChange(newViewport)

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bounds, debouncedOnMapViewportChange, mapContainerRef])

    const handleSearchInput = (show: boolean) => {
        const el = document.getElementById('search_location_map')
        if (show) {
            if (el) el.focus()
            setShowSearchInput(true)
        } else {
            if (el) el.focus()
            setShowSearchInput(false)
        }
    }

    useEffect(() => {
        if (
            !isEmpty(bounds) &&
            !!bounds.bbox &&
            bounds.bbox.every((b) => typeof b === 'number')
        ) {
            handleFitBounds()
        }
    }, [bounds, handleFitBounds])

    return (
        <div className="c-search-control relative">
            <div
                id="search-location-map"
                className={classNames(
                    'absolute right-16 top-0',
                    showSearchInput ? '' : 'hidden'
                )}
            ></div>
            <IconButton
                type="button"
                className="search-control--btn "
                onClick={() => handleSearchInput(!showSearchInput)}
            >
                <SearchIcon />
            </IconButton>
        </div>
    )
}
