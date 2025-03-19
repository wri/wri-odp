// @ts-nocheck
import MapboxDraw, { modes } from '@mapbox/mapbox-gl-draw'
import DrawRectangle from 'mapbox-gl-draw-rectangle-mode'
import { useEffect, useState } from 'react'
import { useControl } from 'react-map-gl'

import type { MapRef, ControlPosition } from 'react-map-gl'

type DrawControlProps = ConstructorParameters<typeof MapboxDraw>[0] & {
    position?: ControlPosition
    onCreate?: (evt: { features: object[] }) => void
    onUpdate?: (evt: { features: object[]; action: string }) => void
    onDelete?: (evt: { features: object[] }) => void
    onClear?: () => void
}

export default function DrawControl(props: DrawControlProps) {
    const [draw, setDraw] = useState(null)
    function create(e) {
        if (draw) {
            draw.deleteAll()
        }
        props.onCreate(e)
    }
    const _props = {
        ...props,
        defaultMode: 'simple_select',
        modes: { ...MapboxDraw.modes, draw_polygon: DrawRectangle },
    }
    const control = useControl<MapboxDraw>(
        () => {
            const _draw = new MapboxDraw(_props)
            setDraw(_draw)
            return _draw
        },
        ({ map }: { map: MapRef }) => {
            map.on('draw.create', create)
        },
        ({ map }: { map: MapRef }) => {
            map.off('draw.create', create)
        },
        {
            position: props.position,
        }
    )

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const button = document.querySelector(
                '.mapbox-gl-draw_ctrl-draw-btn'
            )
            if (button) {
                button.title =
                    'Area Select Tool, use this to create a rectangle that can be used as a bounding box for your search'
                button.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-dashed"><path d="M5 3a2 2 0 0 0-2 2"/><path d="M19 3a2 2 0 0 1 2 2"/><path d="M21 19a2 2 0 0 1-2 2"/><path d="M5 21a2 2 0 0 1-2-2"/><path d="M9 3h1"/><path d="M9 21h1"/><path d="M14 3h1"/><path d="M14 21h1"/><path d="M3 9v1"/><path d="M21 9v1"/><path d="M3 14v1"/><path d="M21 14v1"/></svg>
          <span style="color: black !important; width: auto;">Area Select Tool</span>`
            }
        }
    }, [control])

    return null
}

DrawControl.defaultProps = {
    onCreate: () => {},
    onUpdate: () => {},
    onDelete: () => {},
}
