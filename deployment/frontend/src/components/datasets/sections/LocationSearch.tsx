import { type Resource, View } from '@/interfaces/dataset.interface';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Layer,
  Map,
  type MapLayerMouseEvent,
  type MapRef,
  Marker,
  Source,
  useMap,
} from 'react-map-gl';
import GeocoderControl from '@/components/search/GeocoderControl';
import { useQuery } from 'react-query';
import { type UseFormReturn, useForm } from 'react-hook-form';
import DrawControl from '@/components/search/Draw';
import { type LocationSearchFormType } from './DataFiles';
import { HideBoundaries } from '@/components/_shared/HideBoundaries';

export default function LocationSearch({
  geojsons,
  formObj,
  open,
  toggleDatafileToDownload,
}: {
  geojsons: any[];
  open: boolean;
  formObj: UseFormReturn<LocationSearchFormType>;
  toggleDatafileToDownload: (datafile: Resource) => void;
}) {
  const { setValue, getValues } = formObj;
  const [cursor, setCursor] = useState('grab');

  const mapRef = useRef<MapRef | null>(null);
  const accessToken =
    'pk.eyJ1IjoicmVzb3VyY2V3YXRjaCIsImEiOiJjbHNueG5idGIwOXMzMmp0ZzE1NWVjZDV1In0.050LmRm-9m60lrzhpsKqNA';
  const { data: markers } = useQuery(
    ['markers', geojsons.length],
    async () => {
      const _markers = geojsons
        .filter((g) => g.address)
        .filter(Boolean)
        .map((g) => g.address);
      return await Promise.all(
        _markers.map(async (m) => {
          const res = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${m}.json?access_token=${accessToken}&limit=1`
          );
          const json = await res.json();
          return json.features[0].center;
        })
      );
    }
  );

  // Store a reference to the geojsons by layer ID for lookup
  const layerGeojsonMap = useRef<Record<string, any>>({});

  // Set up the layer reference map whenever geojsons change
  useEffect(() => {
    const newMap: Record<string, any> = {};
    geojsons
      .filter((g) => !g.address)
      .forEach((geojson, index) => {
        const fillLayerId = `fill-layer-${index}`;
        const lineLayerId = `line-layer-${index}`;
        newMap[fillLayerId] = geojson;
        newMap[lineLayerId] = geojson;
      });
    layerGeojsonMap.current = newMap;
  }, [geojsons]);

  // Handle map clicks and determine if a layer was clicked
  const handleMapClick = useCallback(
    (event: MapLayerMouseEvent) => {
      if (!mapRef.current) return;

      // Get the features at the clicked point
      const features = mapRef.current.queryRenderedFeatures(event.point);

      // Check if any of our layers were clicked
      if (features.length > 0) {
        const clickedLayerId = features[0]?.layer.id;
        if (!clickedLayerId) return;
        const geojson = layerGeojsonMap.current[clickedLayerId];

        if (geojson) {
          // Call your toggle function or other actions
          if (geojson.datafile) {
            toggleDatafileToDownload(geojson.datafile);
          }
        }
      }
    },
    [toggleDatafileToDownload]
  );

  const onUpdate = useCallback((e: any) => {
    for (const f of e.features) {
      if (f.geometry.coordinates[0].length === 5) {
        setValue('point', null);
        setValue('location', '');
        setValue('bbox', [
          f.geometry.coordinates[0][2],
          f.geometry.coordinates[0][4],
        ]);
        setValue('bbox', [
          f.geometry.coordinates[0][2],
          f.geometry.coordinates[0][4],
        ]);
      } else {
        setValue('bbox', null);
      }
    }
  }, []);

  useEffect(() => {
    if (mapRef.current && open) {
      mapRef.current.resize();
    }
  }, [mapRef.current, open]);

  const onModeChange = useCallback((e: any) => {
    if (e.mode === 'draw_polygon') {
      setCursor('crosshair');
    } else {
      setCursor('grab');
    }
  }, []);

  return (
    <Map
      ref={(_map) => {
        if (_map) mapRef.current = _map.getMap() as unknown as MapRef;
      }}
      mapboxAccessToken="pk.eyJ1IjoicmVzb3VyY2V3YXRjaCIsImEiOiJjbHNueG5idGIwOXMzMmp0ZzE1NWVjZDV1In0.050LmRm-9m60lrzhpsKqNA"
      style={{ height: 300 }}
      dragRotate={false}
      initialViewState={{
        longitude: 0,
        latitude: 0,
        zoom: 1,
      }}
      touchZoomRotate={false}
      mapStyle="mapbox://styles/mapbox/streets-v9"
      onClick={handleMapClick}
      cursor={cursor}
    >
      <HideBoundaries />
      <GeocoderControl
        mapboxAccessToken="pk.eyJ1IjoicmVzb3VyY2V3YXRjaCIsImEiOiJjbHNueG5idGIwOXMzMmp0ZzE1NWVjZDV1In0.050LmRm-9m60lrzhpsKqNA"
        position="bottom-right"
        placeholder="Search Data Files by location"
        initialValue={formObj.getValues('location')}
        onResult={(e) => {
          setValue('bbox', [
            [e.result.bbox[0], e.result.bbox[1]],
            [e.result.bbox[2], e.result.bbox[3]],
          ]);
          setValue('point', e.result.center);
          if (e.result.place_name.split(',').length <= 2) {
            setValue('location', e.result.place_name);
          }
        }}
        onClear={(e) => {
          setValue('point', null);
          setValue('bbox', null);
          setValue('location', '');
        }}
      />
      {markers?.map((m, index) => (
        <Marker key={index} longitude={m[0]} latitude={m[1]} />
      ))}
      {geojsons
        .filter((g) => !g.address)
        .map((geojson, index) => (
          <Source key={index} type="geojson" data={geojson}>
            <Layer
              id={`fill-layer-${index}`} // Unique ID is crucial
              type="fill"
              paint={{
                'fill-color':
                  geojson.filtered || geojson.selected
                    ? '#023020'
                    : '#BAE1BD',
                'fill-opacity': 0.3,
              }}
            />
            <Layer
              type="line"
              paint={{
                'line-width': 0.5,
                'line-color': '#32864B',
              }}
            />
          </Source>
        ))}{' '}
      <DrawControl
        position="top-left"
        onClear={() => {
          setCursor('grab');
          setValue('bbox', null);
        }}
        displayControlsDefault={false}
        controls={{
          polygon: true,
        }}
        onModeChange={onModeChange}
        defaultMode="simple_select"
        onCreate={onUpdate}
        onUpdate={onUpdate}
        onDelete={() => {
          setCursor('grab');
          setValue('bbox', null);
        }}
      />
    </Map>
  );
}
