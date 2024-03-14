import MapboxDraw, { DrawFeature } from '@mapbox/mapbox-gl-draw'
import DrawRectangle from 'mapbox-gl-draw-rectangle-mode'

import { Layer, Source } from 'react-map-gl'

import type { MapRef } from 'react-map-gl'
import {
    MutableRefObject,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react'
import { LineLayer } from 'mapbox-gl'

export interface DrawProps {
    mapRef: MutableRefObject<MapRef | null>
    onDraw?: (feature: DrawFeature) => void
}

export default function Draw({
    mapRef,
    onDraw = () => {},
}: DrawProps): JSX.Element | null {
    const [isDrawing, setIsDrawing] = useState(true)
    const [features, setFeatures] = useState()
    const drawControlRef = useRef<MapboxDraw>()

    useEffect(() => {
        /*
         * HACK: This weird logic prevents a bug on the
         * first render
         *
         */
        if (isDrawing === undefined) {
            setIsDrawing(true)
            return
        }

        if (!isDrawing) {
            startDrawing()
        } else {
            stopDrawing()
        }

        return () => {
            removeDrawControl()
        }
    }, [isDrawing])

    const drawControlOpts = {
        displayControlsDefault: false,
        defaultMode: 'draw_rectangle',
    }

    const onDrawCreate = useCallback((e: any) => {
        const feature = e.features[0]
        setFeatures(feature)
        drawControlRef.current?.deleteAll()
        onDraw(feature)
    }, [])

    const addDrawControl = () => {
        if (mapRef.current) {
            if (drawControlRef.current) {
                removeDrawControl()
            }

            const modes = {...MapboxDraw.modes, draw_rectangle: DrawRectangle}
            console.log('MODES', modes)
            drawControlRef.current = new MapboxDraw({
                ...drawControlOpts,
                modes,
            })
            mapRef.current.addControl(drawControlRef.current)
            mapRef.current.on('draw.create', onDrawCreate)
        }
    }

    const removeDrawControl = () => {
        if (mapRef.current && drawControlRef.current) {
            mapRef.current.off('draw.create', onDrawCreate)
            mapRef.current.removeControl(drawControlRef.current)
            drawControlRef.current = undefined
        }
    }

    const startDrawing = () => {
        addDrawControl()
    }

    const stopDrawing = () => {
        removeDrawControl()
        setFeatures(undefined)
    }

    const toggleDrawing = () => {
        setIsDrawing(!isDrawing)
    }

    const layerStyle: LineLayer = {
        id: 'drawn-polygon-layer',
        type: 'line',
        paint: {
            'line-color': '#ff0000',
            'line-width': 5,
        },
    }

    return (
        <>
            <button
                className={`absolute left-10 top-10 px-5 py-2 ${
                    isDrawing
                        ? 'bg-neutral-200'
                        : 'bg-neutral-500 text-neutral-200'
                }`}
                onClick={() => toggleDrawing()}
            >
                Draw
            </button>
            {features && (
                <Source
                    id={'drawn-polygon-source'}
                    type="geojson"
                    data={features}
                >
                    {/* @ts-ignore */}
                    <Layer {...layerStyle} />
                </Source>
            )}
        </>
    )
}
