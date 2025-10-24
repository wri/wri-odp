import { useMap } from 'react-map-gl';

export function HideBoundaries() {
    const { current: map } = useMap();
    if (map) {
        map.on('load', () => {
            const layersToHide = [
                'admin-2-boundaries',
                'admin-2-boundaries-bg',
                'admin-3-4-boundaries',
                'admin-3-4-boundaries-bg',
            ];

            layersToHide.forEach((layerId) => {
                // Check if the layer actually exists in the current style before trying to hide it
                if (map && map.getLayer(layerId)) {
                    map.getMap().setLayoutProperty(
                        layerId,
                        'visibility',
                        'none'
                    );
                }
            });
        });
    }
    return null;
}
