import MapboxDraw, { type DrawFeature } from "@mapbox/mapbox-gl-draw";
import { Layer, Source } from "react-map-gl";

import type { MapRef } from "react-map-gl";
import {
    type MutableRefObject,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import { type LineLayer } from "mapbox-gl";
import { useIsDrawing } from "@/utils/storeHooks";
import IconButton from "./IconButton";

export interface DrawProps {
    mapRef: MutableRefObject<MapRef | null>;
    onDraw?: (feature: DrawFeature) => void;
}

export default function Draw({
    mapRef,
    onDraw = () => null,
}: DrawProps): JSX.Element | null {
    const { isDrawing, setIsDrawing } = useIsDrawing();
    const [features, setFeatures] = useState();
    const drawControlRef = useRef<MapboxDraw>();

    useEffect(() => {
        /*
         * HACK: This weird logic prevents a bug on the
         * first render
         *
         */
        if (isDrawing === undefined) {
            setIsDrawing(true);
            return;
        }

        if (!isDrawing) {
            startDrawing();
        } else {
            stopDrawing();
        }

        return () => {
            removeDrawControl();
        };
    }, [isDrawing]);

    const drawControlOpts = {
        displayControlsDefault: false,
        defaultMode: "draw_polygon",
    };

    const onDrawCreate = useCallback((e) => {
        const feature = e.features[0];
        setFeatures(feature);
        drawControlRef.current?.deleteAll();
        onDraw(feature);
    }, []);

    const addDrawControl = () => {
        if (mapRef.current) {
            if (drawControlRef.current) {
                removeDrawControl();
            }

            drawControlRef.current = new MapboxDraw(drawControlOpts);
            mapRef.current.addControl(drawControlRef.current);
            mapRef.current.on("draw.create", onDrawCreate);
        }
    };

    const removeDrawControl = () => {
        if (mapRef.current && drawControlRef.current) {
            mapRef.current.off("draw.create", onDrawCreate);
            mapRef.current.removeControl(drawControlRef.current);
            drawControlRef.current = undefined;
        }
    };

    const startDrawing = () => {
        addDrawControl();
    };

    const stopDrawing = () => {
        removeDrawControl();
        setFeatures(undefined);
    };

    const toggleDrawing = () => {
        setIsDrawing(!isDrawing);
    };

    const layerStyle: LineLayer = {
        id: "drawn-polygon-layer",
        type: "line",
        paint: {
            "line-color": "#ff0000",
            "line-width": 5,
        },
    };

    return (
        <>
            <IconButton
                className={`${isDrawing ? "" : ""
                    }`}
                onClick={() => toggleDrawing()}
            >
                <DrawIcon />
            </IconButton>
            {features && (
                <Source id={"drawn-polygon-source"} type="geojson" data={features}>
                    <Layer {...layerStyle} />
                </Source>
            )}
        </>
    );
}

function DrawIcon() {
    return <svg width="35" height="36" viewBox="0 0 35 36" fill="none" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
        <rect y="0.785156" width="35" height="35" fill="url(#pattern0)" />
        <defs>
            <pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">
                <use xlinkHref="#image0_7_163" transform="scale(0.005)" />
            </pattern>
            <image id="image0_7_163" width="200" height="200" xlinkHref="data:image/png;base64,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" />
        </defs>
    </svg>

}
