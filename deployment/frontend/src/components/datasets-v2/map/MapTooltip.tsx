import {
    forwardRef,
    useCallback,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';
import { type MapLayerMouseEvent } from 'mapbox-gl';
import {
    type LngLat,
    type MapGeoJSONFeature,
} from 'react-map-gl/dist/esm/types';
import {
    Button,
    getThemedColor,
    getThemedFontSize,
    getThemedLineHeight,
    getThemedSpacing,
    MapPopUp,
} from '@worldresources/wri-design-systems';
import numeral from 'numeral';
import { useLayersFromRW } from '@/utils/queryHooks';

export interface MapTooltipRef {
    onClickLayer: (e: MapLayerMouseEvent) => void | undefined;
    close: () => void;
}

type LayerInfo = {
    id: string;
    name: string;
    properties?: Array<{
        config: {
            property?: string;
            column?: string;
            format?: string;
            prefix?: string;
            suffix?: string;
            type?: string;
        };
value: string | number | boolean | null | undefined;
    }>;
};

/**
 * Map popup for datasets-v2 built on the WRI design system `MapPopUp`
 * component. An invisible anchor element is positioned over the clicked
 * map point (screen coordinates) and the design-system popup is anchored
 * to it.
 */
export default forwardRef(function MapTooltip(
    { mapRef }: { mapRef: React.MutableRefObject<unknown> },
    ref
) {
    const { data: layers } = useLayersFromRW();
    const anchorRef = useRef<HTMLButtonElement | null>(null);
    const [open, setOpen] = useState(false);
    const [coordinates, setCoordinates] = useState<{ lng: number; lat: number }>();
    const [layersInfo, setLayersInfo] = useState<LayerInfo[]>();

    const close = useCallback(() => {
        setOpen(false);
        setLayersInfo(undefined);
    }, []);

    const onClickLayer = useCallback(
        ({
            features,
            lngLat,
            point,
        }: {
            features?: MapGeoJSONFeature[];
            lngLat: LngLat;
            point?: { x: number; y: number };
        }) => {
            const anchor = anchorRef.current;
            const map = mapRef.current as
                | { getCanvas?: () => HTMLElement }
                | null;

            // Position the invisible anchor over the clicked point.
            if (anchor && map?.getCanvas) {
                const canvas = map.getCanvas();
                const canvasRect = canvas.getBoundingClientRect();
                const containerRect = anchor.parentElement?.getBoundingClientRect();

                if (containerRect) {
                    const x = canvasRect.left - containerRect.left + (point?.x ?? 0);
                    const y = canvasRect.top - containerRect.top + (point?.y ?? 0);
                    anchor.style.left = `${x}px`;
                    anchor.style.top = `${y}px`;
                }
            }

            setCoordinates({ lng: lngLat.lng, lat: lngLat.lat });

            const layersInfo: LayerInfo[] = [];
            for (const layer of layers ?? []) {
                const feature = features?.find(
                    //  @ts-ignore
                    (f) => (f?.source || f.layer?.source) === layer.id
                );
                const { interactionConfig } = layer;

                const layerInfo: LayerInfo = {
                    id: layer.id,
                    name: layer.name,
                };

                if (feature && interactionConfig?.output) {
                    //  TODO: output is supposed to be an array
                    //  @ts-ignore
                    layerInfo.properties = interactionConfig.output.map(
                        (c: any) => {
                            return {
                                config: c,
                                //  TODO: c.column is supposed to be a string
                                //  @ts-ignore
                                value: feature.properties[c.column],
                            };
                        }
                    );
                }

                layersInfo.push(layerInfo);
            }
            setLayersInfo(layersInfo);
            setOpen(true);
        },
        [layers, mapRef]
    );

    useImperativeHandle(
        ref,
        () => ({
            onClickLayer,
            close,
        }),
        [onClickLayer, close]
    );

    const layersWithData = (layersInfo ?? []).filter(
        (info) => info.properties?.length
    );

    return (
        <>
            <button
                ref={anchorRef}
                aria-hidden
                tabIndex={-1}
                style={{
                    position: 'absolute',
                    width: 0,
                    height: 0,
                    padding: 0,
                    border: 'none',
                    background: 'transparent',
                    pointerEvents: 'none',
                }}
            />
            <MapPopUp
                open={open}
                onOpenChange={(next) => {
                    setOpen(next);
                    if (!next) setLayersInfo(undefined);
                }}
                anchorRef={anchorRef}
                placement="right"
                offset={16}
                header={
                    <div style={{ display: 'flex', flexDirection: 'column', gap: getThemedSpacing(100) }}>
                        <p
                            style={{
                                margin: 0,
                                color: getThemedColor('neutral', 900),
                                fontSize: getThemedFontSize(400),
                                lineHeight: getThemedLineHeight(600),
                                fontWeight: 700,
                            }}
                        >
                            Selected location
                        </p>
                        {coordinates && (
                            <p
                                style={{
                                    margin: 0,
                                    color: getThemedColor('neutral', 700),
                                    fontSize: getThemedFontSize(300),
                                    lineHeight: getThemedLineHeight(500),
                                }}
                            >
                                Lat: {coordinates.lat.toFixed(5)}, Lon:{' '}
                                {coordinates.lng.toFixed(5)}
                            </p>
                        )}
                    </div>
                }
                content={
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {layersWithData.length > 0 ? (
                            layersWithData.map((info) => (
                                <div key={info.id}>
                                    {info.properties?.map((prop, j) => {
                                        const value =
                                            prop.config.format &&
                                            prop.config.type === 'number'
                                                ? numeral(prop.value).format(
                                                      prop.config.format
                                                  )
                                                : prop.value;
                                        return (
                                            <div
                                                key={`${info.id}-prop-${j}`}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: getThemedSpacing(200),
                                                    padding: `${getThemedSpacing(300)} ${getThemedSpacing(400)}`,
                                                    fontSize: getThemedFontSize(400),
                                                    lineHeight: getThemedLineHeight(600),
                                                }}
                                            >
                                                <p
                                                    style={{
                                                        margin: 0,
                                                        flex: '1 0 0',
                                                        color: getThemedColor('neutral', 700),
                                                    }}
                                                >
                                                    {prop.config.property ||
                                                        prop.config.column}
                                                </p>
                                                <p
                                                    style={{
                                                        margin: 0,
                                                        flex: '1 0 0',
                                                        textAlign: 'right',
                                                        fontWeight: 700,
                                                        color: getThemedColor('neutral', 900),
                                                    }}
                                                >
                                                    {prop.config.prefix}
                                                    {value}
                                                    {prop.config.suffix}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))
                        ) : (
                            <div
                                style={{
                                    padding: `${getThemedSpacing(300)} ${getThemedSpacing(400)}`,
                                    fontSize: getThemedFontSize(400),
                                    lineHeight: getThemedLineHeight(600),
                                    color: getThemedColor('neutral', 700),
                                }}
                            >
                                No info found for this coordinate
                            </div>
                        )}
                    </div>
                }
                footer={
                    <Button
                        size="small"
                        variant="primary"
                        label="Analyse in Global Forest Watch"
                        onClick={() =>
                            coordinates &&
                            window.open(
                                `https://www.globalforestwatch.org/map/map/3d/?mapLat=${coordinates.lat}&mapLng=${coordinates.lng}&zoom=4`,
                                '_blank',
                                'noopener,noreferrer'
                            )
                        }
                    />
                }
                closeOnEscape
                closeOnOutsideClick
            />
        </>
    );
});