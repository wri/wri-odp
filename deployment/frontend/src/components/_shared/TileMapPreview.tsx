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
import dynamic from 'next/dynamic';

const DrawControl = dynamic(() => import('@/components/search/Draw'), {
    ssr: false,
});

const MAPBOX_TOKEN =
    'pk.eyJ1IjoicmVzb3VyY2V3YXRjaCIsImEiOiJjbHNueG5idGIwOXMzMmp0ZzE1NWVjZDV1In0.050LmRm-9m60lrzhpsKqNA';

const TILE_ID_RE = /^(\d+)([NSns])_(\d+)([EWew])$/;

type HoverInfo = { longitude: number; latitude: number; tileId: string };

type ParsedTile = {
    name: string;
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

    return {
        name: path,
        tileId,
        bbox: [lon, lat - tileSizeDeg, lon + tileSizeDeg, lat],
    };
}

function bboxesIntersect(
    a: [number, number, number, number],
    b: [number, number, number, number]
) {
    return !(a[2] <= b[0] || a[0] >= b[2] || a[3] <= b[1] || a[1] >= b[3]);
}

function tileToFeature(tile: ParsedTile) {
    const [minLon, minLat, maxLon, maxLat] = tile.bbox;
    return {
        type: 'Feature' as const,
        properties: { name: tile.name, tileId: tile.tileId },
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

export interface TileMapPreviewProps {
    tileNames: string[];
    // interactive mode — omit for read-only
    selectedTiles?: Set<string>;
    onToggleTile?: (name: string) => void;
    onSelectTilesInArea?: (names: string[]) => void;
}

export function TileMapPreview({
    tileNames,
    selectedTiles,
    onToggleTile,
    onSelectTilesInArea,
}: TileMapPreviewProps) {
    const interactive = !!onToggleTile;
    const mapRef = useRef<MapRef | null>(null);
    const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
    const [drawCursor, setDrawCursor] = useState(false);

    const parsedTiles = useMemo(() => {
        const result: ParsedTile[] = [];
        for (const name of tileNames) {
            const t = parseTilePath(name);
            if (t) result.push(t);
        }
        return result;
    }, [tileNames]);

    // read-only: all tiles in one source
    const allFeatures = useMemo(
        () => ({
            type: 'FeatureCollection' as const,
            features: parsedTiles.map(tileToFeature),
        }),
        [parsedTiles]
    );

    // interactive: split into selected / unselected
    const selectedFeatures = useMemo(
        () => ({
            type: 'FeatureCollection' as const,
            features: parsedTiles
                .filter((t) => selectedTiles?.has(t.name))
                .map(tileToFeature),
        }),
        [parsedTiles, selectedTiles]
    );

    const unselectedFeatures = useMemo(
        () => ({
            type: 'FeatureCollection' as const,
            features: parsedTiles
                .filter((t) => !selectedTiles?.has(t.name))
                .map(tileToFeature),
        }),
        [parsedTiles, selectedTiles]
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

    const interactiveLayerIds = interactive
        ? ['tiles-unselected-fill', 'tiles-selected-fill']
        : ['tiles-preview-fill'];

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

    const handleClick = useCallback(
        (e: MapLayerMouseEvent) => {
            if (!interactive || !onToggleTile) return;
            const feature = e.features?.[0];
            const name = feature?.properties?.name as string | undefined;
            if (name) onToggleTile(name);
        },
        [interactive, onToggleTile]
    );

    const onDrawCreate = useCallback(
        (e: { features: object[] }) => {
            if (!onSelectTilesInArea) return;
            for (const raw of e.features) {
                const f = raw as { geometry?: { coordinates?: number[][][] } };
                const ring = f.geometry?.coordinates?.[0];
                if (!ring || ring.length < 4) continue;
                let minLon = Infinity, minLat = Infinity,
                    maxLon = -Infinity, maxLat = -Infinity;
                for (const [lon, lat] of ring) {
                    if (lon === undefined || lat === undefined) continue;
                    if (lon < minLon) minLon = lon;
                    if (lon > maxLon) maxLon = lon;
                    if (lat < minLat) minLat = lat;
                    if (lat > maxLat) maxLat = lat;
                }
                if (!Number.isFinite(minLon)) continue;
                const drawn: [number, number, number, number] = [
                    minLon, minLat, maxLon, maxLat,
                ];
                const matched = parsedTiles
                    .filter((t) => bboxesIntersect(drawn, t.bbox))
                    .map((t) => t.name);
                if (matched.length > 0) onSelectTilesInArea(matched);
            }
            setDrawCursor(false);
        },
        [parsedTiles, onSelectTilesInArea]
    );

    const cursor = drawCursor ? 'crosshair' : hoverInfo ? 'pointer' : 'grab';

    if (parsedTiles.length === 0) return null;

    return (
        <div className="flex flex-col gap-y-1">
            {interactive && (
                <p className="text-xs text-neutral-500">
                    Click a tile to toggle it, or use the area-select tool to
                    select all tiles that intersect a drawn rectangle.
                </p>
            )}
            <div style={{ maxWidth: 800, aspectRatio: '16/9', width: '100%' }}>
                <Map
                    ref={(_map) => {
                        if (_map)
                            mapRef.current =
                                _map.getMap() as unknown as MapRef;
                    }}
                    mapboxAccessToken={MAPBOX_TOKEN}
                    style={{ width: '100%', height: '100%' }}
                    dragRotate={false}
                    touchZoomRotate={false}
                    initialViewState={{ longitude: 0, latitude: 0, zoom: 1 }}
                    mapStyle="mapbox://styles/mapbox/streets-v9"
                    interactiveLayerIds={interactiveLayerIds}
                    onMouseMove={onMouseMove}
                    onMouseLeave={onMouseLeave}
                    onClick={interactive ? handleClick : undefined}
                    cursor={cursor}
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

                    {interactive ? (
                        <>
                            <Source
                                id="tiles-unselected"
                                type="geojson"
                                data={unselectedFeatures}
                            >
                                <Layer
                                    id="tiles-unselected-fill"
                                    type="fill"
                                    paint={{
                                        'fill-color': '#BAE1BD',
                                        'fill-opacity': 0.25,
                                    }}
                                />
                                <Layer
                                    id="tiles-unselected-line"
                                    type="line"
                                    paint={{
                                        'line-color': '#32864B',
                                        'line-width': 0.5,
                                    }}
                                />
                            </Source>
                            <Source
                                id="tiles-selected"
                                type="geojson"
                                data={selectedFeatures}
                            >
                                <Layer
                                    id="tiles-selected-fill"
                                    type="fill"
                                    paint={{
                                        'fill-color': '#023020',
                                        'fill-opacity': 0.45,
                                    }}
                                />
                                <Layer
                                    id="tiles-selected-line"
                                    type="line"
                                    paint={{
                                        'line-color': '#023020',
                                        'line-width': 1.2,
                                    }}
                                />
                            </Source>
                            <DrawControl
                                position="top-left"
                                displayControlsDefault={false}
                                controls={{ polygon: true }}
                                defaultMode="simple_select"
                                onCreate={onDrawCreate}
                                onUpdate={onDrawCreate}
                                onModeChange={(e: { mode: string }) =>
                                    setDrawCursor(e.mode === 'draw_polygon')
                                }
                                onClear={() => setDrawCursor(false)}
                                onDelete={() => setDrawCursor(false)}
                            />
                        </>
                    ) : (
                        <Source
                            id="tiles-preview"
                            type="geojson"
                            data={allFeatures}
                        >
                            <Layer
                                id="tiles-preview-fill"
                                type="fill"
                                paint={{
                                    'fill-color': '#BAE1BD',
                                    'fill-opacity': 0.4,
                                }}
                            />
                            <Layer
                                id="tiles-preview-line"
                                type="line"
                                paint={{
                                    'line-color': '#32864B',
                                    'line-width': 0.8,
                                }}
                            />
                        </Source>
                    )}
                </Map>
            </div>
        </div>
    );
}
