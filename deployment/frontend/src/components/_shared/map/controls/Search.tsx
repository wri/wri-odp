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

export default function Search({
    mapContainerRef,
}: {
    mapContainerRef: MutableRefObject<HTMLDivElement | null>
}) {
    const [showSearchInput, setShowSearchInput] = useState(false)
    // const geosuggest = useRef<Geosuggest | null>(null)
    const { setViewState, viewState } = useMapState()
    const { bounds, setBounds } = useBounds()

    const debouncedOnMapViewportChange = useDebouncedCallback((v) => {
        setViewState(v)
    }, 250)

    const handleSearch = useCallback(
        (locationParams) => {
            setBounds({
                ...locationParams,
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
                [bbox[0], bbox[1]],
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
        // debouncedOnMapViewportChange(newViewport);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bounds, debouncedOnMapViewportChange, mapContainerRef])

    const onSuggestSelect = (e: Suggest) => {
        if (e) {
            const { gmaps, location } = e
            const viewport = gmaps?.geometry && gmaps.geometry.viewport

            if (viewport) {
                const { south, west, north, east } = viewport.toJSON()
                handleSearch({ bbox: [east, south, west, north] })
            }

            if (!viewport && location) {
                handleSearch({ ...location, zoom: 7 })
            }

            handleSearchInput(false)
        }
    }

    const onKeyDown = (e: { keyCode: number }) => {
        if (e.keyCode === 27) handleSearchInput(false)
    }

    const handleSearchInput = (show: boolean) => {
        if (show) {
            // geosuggest.current?.focus();
            setShowSearchInput(true)
        } else {
            // geosuggest.current?.clear();
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
        <div className="c-search-control">
            {showSearchInput && (
                /* <Geosuggest
          onSuggestSelect={onSuggestSelect}
          onKeyDown={onKeyDown}
        /> */ <div></div>
            )}
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
