import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Layer,
    Map,
    type MapLayerMouseEvent,
    type MapRef,
    Popup,
    Source,
} from 'react-map-gl';

type HoverInfo = { longitude: number; latitude: number; tileId: string };
import GeocoderControl from '@/components/search/GeocoderControl';
import DrawControl from '@/components/search/Draw';
import { HideBoundaries } from '@/components/_shared/HideBoundaries';

const MAPBOX_TOKEN =
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

const TILE_FILL_LAYERS = [
    'tiles-unselected-fill',
    'tiles-selected-fill',
];

const TILE_ID_RE = /^(\d+)([NSns])_(\d+)([EWew])$/;

type ParsedTile = {
    name: string;
    tileId: string;
    bbox: [number, number, number, number];
};

// Parses a GFW Data API raster-tile-set path of the form
// `s3://.../<grid_size_deg>/<grid_pixels>/<pixel_meaning>/<format>/<lat><N|S>_<lon><E|W>.tif`
// and returns the geographic bounding box of the tile, derived from its
// NW-corner-encoded tile id and the grid size (in degrees).
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
        parseInt(match[1]!, 10) *
        (match[2]!.toUpperCase() === 'N' ? 1 : -1);
    const lon =
        parseInt(match[3]!, 10) *
        (match[4]!.toUpperCase() === 'E' ? 1 : -1);

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

export interface TileLocationSelectProps {
    tileNames: string[];
    selectedTiles: Set<string>;
    onToggleTile: (name: string) => void;
    onSelectTilesInArea: (names: string[]) => void;
    open: boolean;
}

export default function TileLocationSelect({
    tileNames,
    selectedTiles,
    onToggleTile,
    onSelectTilesInArea,
    open,
}: TileLocationSelectProps) {
    const mapRef = useRef<MapRef | null>(null);
    const [cursor, setCursor] = useState('grab');
    const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
    const initialFitDone = useRef(false);

    const onMouseMove = useCallback((e: MapLayerMouseEvent) => {
        const feature = e.features?.[0];
        if (feature) {
            setHoverInfo({
                longitude: e.lngLat.lng,
                latitude: e.lngLat.lat,
                tileId: feature.properties?.name as string,
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

    const skipped = tileNames.length - parsedTiles.length;

    const selectedFeatures = useMemo(
        () => ({
            type: 'FeatureCollection' as const,
            features: parsedTiles
                .filter((t) => selectedTiles.has(t.name))
                .map(tileToFeature),
        }),
        [parsedTiles, selectedTiles]
    );

    const unselectedFeatures = useMemo(
        () => ({
            type: 'FeatureCollection' as const,
            features: parsedTiles
                .filter((t) => !selectedTiles.has(t.name))
                .map(tileToFeature),
        }),
        [parsedTiles, selectedTiles]
    );

    const tilesUnion = useMemo(() => {
        if (parsedTiles.length === 0) return null;
        let minLon = 180;
        let minLat = 90;
        let maxLon = -180;
        let maxLat = -90;
        for (const t of parsedTiles) {
            if (t.bbox[0] < minLon) minLon = t.bbox[0];
            if (t.bbox[1] < minLat) minLat = t.bbox[1];
            if (t.bbox[2] > maxLon) maxLon = t.bbox[2];
            if (t.bbox[3] > maxLat) maxLat = t.bbox[3];
        }
        return [
            [minLon, minLat],
            [maxLon, maxLat],
        ] as [[number, number], [number, number]];
    }, [parsedTiles]);

    useEffect(() => {
        if (!mapRef.current || !open) return;
        mapRef.current.resize();
        if (tilesUnion && !initialFitDone.current) {
            mapRef.current.fitBounds(tilesUnion, {
                padding: 24,
                animate: false,
            });
            initialFitDone.current = true;
        }
    }, [open, tilesUnion]);

    useEffect(() => {
        initialFitDone.current = false;
    }, [tileNames]);

    const handleMapClick = useCallback(
        (event: MapLayerMouseEvent) => {
            if (!mapRef.current) return;
            const features = mapRef.current.queryRenderedFeatures(
                event.point,
                { layers: TILE_FILL_LAYERS }
            );
            if (features.length === 0) return;
            const name = features[0]?.properties?.name as string | undefined;
            if (name) onToggleTile(name);
        },
        [onToggleTile]
    );

    const onCreate = useCallback(
        (e: { features: object[] }) => {
            for (const raw of e.features) {
                const f = raw as {
                    geometry?: { coordinates?: number[][][] };
                };
                const ring = f.geometry?.coordinates?.[0];
                if (!ring || ring.length < 4) continue;

                let minLon = Infinity;
                let minLat = Infinity;
                let maxLon = -Infinity;
                let maxLat = -Infinity;
                for (const [lon, lat] of ring) {
                    if (lon === undefined || lat === undefined) continue;
                    if (lon < minLon) minLon = lon;
                    if (lon > maxLon) maxLon = lon;
                    if (lat < minLat) minLat = lat;
                    if (lat > maxLat) maxLat = lat;
                }
                if (!Number.isFinite(minLon)) continue;

                const drawn: [number, number, number, number] = [
                    minLon,
                    minLat,
                    maxLon,
                    maxLat,
                ];
                const matched = parsedTiles
                    .filter((t) => bboxesIntersect(drawn, t.bbox))
                    .map((t) => t.name);
                if (matched.length > 0) onSelectTilesInArea(matched);
            }
            setCursor('grab');
        },
        [parsedTiles, onSelectTilesInArea]
    );

    const onModeChange = useCallback((e: { mode: string }) => {
        setCursor(e.mode === 'draw_polygon' ? 'crosshair' : 'grab');
    }, []);

    return (
        <div className="flex flex-col gap-y-2">
            <p className="text-xs text-neutral-600">
                Click a tile to toggle its selection, or use the area-select
                tool to add every tile that intersects a drawn rectangle.
                {skipped > 0 && (
                    <span className="ml-1 text-amber-700">
                        ({skipped} tile{skipped === 1 ? '' : 's'} could not be
                        plotted because their names don&apos;t encode a
                        geographic location.)
                    </span>
                )}
            </p>
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
                initialViewState={{
                    longitude: 0,
                    latitude: 0,
                    zoom: 1,
                }}
                mapStyle="mapbox://styles/mapbox/streets-v9"
                onClick={handleMapClick}
                interactiveLayerIds={TILE_FILL_LAYERS}
                onMouseMove={onMouseMove}
                onMouseLeave={onMouseLeave}
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
                            {hoverInfo.tileId.split('/').pop() ?? hoverInfo.tileId}
                        </span>
                    </Popup>
                )}
                <GeocoderControl
                    mapboxAccessToken={MAPBOX_TOKEN}
                    position="bottom-right"
                    placeholder="Search by location"
                />
                <Source
                    id="unselected-tiles"
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
                    id="selected-tiles"
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
                    onCreate={onCreate}
                    onUpdate={onCreate}
                    onModeChange={onModeChange}
                    onClear={() => setCursor('grab')}
                    onDelete={() => setCursor('grab')}
                />
            </Map>
            </div>
        </div>
    );
}
