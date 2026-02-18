import { useMap } from 'react-map-gl';

export function GetLayers() {
  const { current: map } = useMap();
  if (map) {
    map.on('click', () => {
      if (map) {
        console.log('LAYERS');
        console.log(map.getStyle().layers);
        console.log(map.getStyle().sources);
      }
    });
  }
  return null;
}
