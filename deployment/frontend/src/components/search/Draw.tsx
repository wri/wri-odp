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
    function getAction(e) {
        console.log(e)
    }
    function deleteAllFeatures(e) {
        if (draw) {
            const data = draw.getAll()
            if (draw.getMode() == 'draw_polygon') {
                var pids = []

                // ID of the added template empty feature
                const lid = data.features[data.features.length - 1].id

                data.features.forEach((f) => {
                    if (f.geometry.type === 'Polygon' && f.id !== lid) {
                        pids.push(f.id)
                    }
                })
                draw.delete(pids)
                props.onUpdate({
                    features: data.features,
                    action: 'draw_polygon',
                })
            }
        }
    }
    const _props = {
        ...props,
        defaultMode: 'simple_select',
        modes: { ...MapboxDraw.modes, draw_polygon: DrawRectangle },
    }
    useControl<MapboxDraw>(
        () => {
            const _draw = new MapboxDraw(_props)
            setDraw(_draw)
            return _draw
        },
        ({ map }: { map: MapRef }) => {
            map.on('draw.create', props.onCreate)
            map.on('draw.update', props.onUpdate)
            map.on('draw.modechange', deleteAllFeatures)
            map.on('draw.trash', deleteAllFeatures)
            map.on('draw.actionable', getAction)
        },
        ({ map }: { map: MapRef }) => {
            map.off('draw.create', props.onCreate)
            map.off('draw.update', props.onUpdate)
            map.off('draw.delete', props.onDelete)
            map.off('draw.modechange', deleteAllFeatures)
            map.off('draw.trash', deleteAllFeatures)
            map.off('draw.actionable', getAction)
        },
        {
            position: props.position,
        }
    )

    return null
}

DrawControl.defaultProps = {
    onCreate: () => {},
    onUpdate: () => {},
    onDelete: () => {},
}
