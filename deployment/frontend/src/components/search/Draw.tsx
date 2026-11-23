// @ts-nocheck
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import DrawRectangle from 'mapbox-gl-draw-rectangle-mode';
import { useEffect, useRef } from 'react';
import { useControl } from 'react-map-gl';

import type { MapRef, ControlPosition } from 'react-map-gl';

type DrawControlProps = ConstructorParameters<typeof MapboxDraw>[0] & {
    position?: ControlPosition;
    onCreate?: (evt: { features: object[] }) => void;
    onUpdate?: (evt: { features: object[]; action: string }) => void;
    onDelete?: (evt: { features: object[] }) => void;
    onModeChange?: (evt: { mode: string }) => void;
    onClear?: () => void;
};

export default function DrawControl(props: DrawControlProps) {
    // The map listeners below are bound once, on control mount, so they must
    // read the latest callbacks through a ref. Capturing `props` directly would
    // freeze the first render's callbacks, and handlers such as the area select
    // would keep working from stale state.
    const propsRef = useRef(props);
    propsRef.current = props;
    // Same for the instance: it is created inside `useControl`, after this
    // render, so a closure over the state value would stay `null` forever and
    // the previous shape would never be removed.
    const drawRef = useRef(null);

    function create(e: { features: object[] }) {
        // One shape at a time: the search targets the rectangle just drawn.
        drawRef.current?.deleteAll();
        propsRef.current.onCreate?.(e);
    }

    function update(e: { features: object[]; action: string }) {
        propsRef.current.onUpdate?.(e);
    }

    function remove(e: { features: object[] }) {
        propsRef.current.onDelete?.(e);
    }

    function modeChange(e: { mode: string }) {
        propsRef.current.onModeChange?.(e);
    }

    function clear() {
        propsRef.current.onClear?.();
    }

    const _props = {
        ...props,
        defaultMode: 'simple_select',
        modes: { ...MapboxDraw.modes, draw_polygon: DrawRectangle },
    };
    const control = useControl<MapboxDraw>(
        () => {
            const _draw = new MapboxDraw(_props);
            drawRef.current = _draw;
            return _draw;
        },
        ({ map }: { map: MapRef }) => {
            map.on('draw.modechange', modeChange);
            map.on('draw.create', create);
            map.on('draw.update', update);
            map.on('draw.delete', remove);
            map.on('draw.clear', clear);
        },
        ({ map }: { map: MapRef }) => {
            map.off('draw.create', create);
            map.off('draw.update', update);
            map.off('draw.delete', remove);
            map.off('draw.modechange', modeChange);
            map.off('draw.clear', clear);
        },
        {
            position: props.position,
        }
    );

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const button = document.querySelector('.mapbox-gl-draw_ctrl-draw-btn');
            if (button) {
                button.title =
                    'Area Select Tool, use this to create a rectangle that can be used as a bounding box for your search';
                button.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-dashed"><path d="M5 3a2 2 0 0 0-2 2"/><path d="M19 3a2 2 0 0 1 2 2"/><path d="M21 19a2 2 0 0 1-2 2"/><path d="M5 21a2 2 0 0 1-2-2"/><path d="M9 3h1"/><path d="M9 21h1"/><path d="M14 3h1"/><path d="M14 21h1"/><path d="M3 9v1"/><path d="M21 9v1"/><path d="M3 14v1"/><path d="M21 14v1"/></svg>
          <span style="width: auto;">Area Select Tool</span>`;
            }
        }
    }, [control]);

    return null;
}

DrawControl.defaultProps = {
    onCreate: () => {},
    onUpdate: () => {},
    onDelete: () => {},
};
