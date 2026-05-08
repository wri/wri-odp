import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Layer,
    Map,
    type MapLayerMouseEvent,
    type MapRef,
    Popup,
    Source,
} from 'react-map-gl';
import { HideBoundaries } from './HideBoundaries';

type HoverInfo = { longitude: number; latitude: number; tileId: string };

const MAPBOX_TOKEN =
    'pk.eyJ1IjoicmVzb3VyY2V3YXRjaCIsImEiOiJjbHNueG5idGIwOXMzMmp0ZzE1NWVjZDV1In0.050LmRm-9m60lrzhpsKqNA';

const TILE_ID_RE = /^(\d+)([NSns])_(\d+)([EWew])$/;

type ParsedTile = {
    tileId: string;
    bbox: [number, number, number, number];
};

function parseTilePath(path: string): ParsedTile | null {
    const parts = path.split('/');
    if (parts.length < 5) return null;

    const filename = parts[parts.length - 1];
    const grid1 = parts[parts.length - 5];
    if (!filename || !grid1) return null;

    const tileSizeDeg = parseInt(grid1, 10);
    if (!Number.isFinite(tileSizeDeg) || tileSizeDeg <= 0) return null;

    const tileId = filename.replace(/\.[^.]+$/, '');
    const match = TILE_ID_RE.exec(tileId);
    if (!match) return null;

    const lat =
        parseInt(match[1]!, 10) * (match[2]!.toUpperCase() === 'N' ? 1 : -1);
    const lon =
        parseInt(match[3]!, 10) * (match[4]!.toUpperCase() === 'E' ? 1 : -1);

    return { tileId, bbox: [lon, lat - tileSizeDeg, lon + tileSizeDeg, lat] };
}

function tileToFeature(tile: ParsedTile) {
    const [minLon, minLat, maxLon, maxLat] = tile.bbox;
    return {
        type: 'Feature' as const,
        properties: { tileId: tile.tileId },
        geometry: {
            type: 'Polygon' as const,
            coordinates: [
                [
                    [minLon, minLat],
                    [maxLon, minLat],
                    [maxLon, maxLat],
                    [minLon, maxLat],
                    [minLon, minLat],
                ],
            ],
        },
    };
}

export function TileMapPreview({ tileNames }: { tileNames: string[] }) {
    const mapRef = useRef<MapRef | null>(null);
    const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);

    const onMouseMove = useCallback((e: MapLayerMouseEvent) => {
        const feature = e.features?.[0];
        if (feature) {
            setHoverInfo({
                longitude: e.lngLat.lng,
                latitude: e.lngLat.lat,
                tileId: feature.properties?.tileId as string,
            });
        } else {
            setHoverInfo(null);
        }
    }, []);

    const onMouseLeave = useCallback(() => setHoverInfo(null), []);

    const parsedTiles = useMemo(() => {
        const result: ParsedTile[] = [];
        for (const name of tileNames) {
            const t = parseTilePath(name);
            if (t) result.push(t);
        }
        return result;
    }, [tileNames]);

    const geojson = useMemo(
        () => ({
            type: 'FeatureCollection' as const,
            features: parsedTiles.map(tileToFeature),
        }),
        [parsedTiles]
    );

    const bounds = useMemo((): [[number, number], [number, number]] | null => {
        if (parsedTiles.length === 0) return null;
        let minLon = 180, minLat = 90, maxLon = -180, maxLat = -90;
        for (const t of parsedTiles) {
            if (t.bbox[0] < minLon) minLon = t.bbox[0];
            if (t.bbox[1] < minLat) minLat = t.bbox[1];
            if (t.bbox[2] > maxLon) maxLon = t.bbox[2];
            if (t.bbox[3] > maxLat) maxLat = t.bbox[3];
        }
        return [[minLon, minLat], [maxLon, maxLat]];
    }, [parsedTiles]);

    useEffect(() => {
        if (!mapRef.current || !bounds) return;
        mapRef.current.fitBounds(bounds, { padding: 24, animate: false });
    }, [bounds]);

    if (parsedTiles.length === 0) return null;

    return (
        <div style={{ maxWidth: 800, aspectRatio: '16/9', width: '100%' }}>
            <Map
                ref={(_map) => {
                    if (_map)
                        mapRef.current = _map.getMap() as unknown as MapRef;
                }}
                mapboxAccessToken={MAPBOX_TOKEN}
                style={{ width: '100%', height: '100%' }}
                dragRotate={false}
                touchZoomRotate={false}
                initialViewState={{ longitude: 0, latitude: 0, zoom: 1 }}
                mapStyle="mapbox://styles/mapbox/streets-v9"
                interactiveLayerIds={['tiles-preview-fill']}
                onMouseMove={onMouseMove}
                onMouseLeave={onMouseLeave}
                cursor={hoverInfo ? 'pointer' : 'grab'}
            >
                <HideBoundaries />
                {hoverInfo && (
                    <Popup
                        longitude={hoverInfo.longitude}
                        latitude={hoverInfo.latitude}
                        closeButton={false}
                        closeOnClick={false}
                        anchor="bottom"
                        offset={6}
                    >
                        <span className="text-xs font-semibold text-stone-900">
                            {hoverInfo.tileId}
                        </span>
                    </Popup>
                )}
                <Source id="tiles-preview" type="geojson" data={geojson}>
                    <Layer
                        id="tiles-preview-fill"
                        type="fill"
                        paint={{ 'fill-color': '#BAE1BD', 'fill-opacity': 0.4 }}
                    />
                    <Layer
                        id="tiles-preview-line"
                        type="line"
                        paint={{ 'line-color': '#32864B', 'line-width': 0.8 }}
                    />
                </Source>
            </Map>
        </div>
    );
}
