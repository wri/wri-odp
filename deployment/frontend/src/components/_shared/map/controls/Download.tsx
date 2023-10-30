import { useLayersFromRW } from "@/utils/queryHooks";
import {
    AnyLayer,
    RasterLayer,
    FillLayer,
    LineLayer,
    SymbolLayer,
    CircleLayer,
} from "mapbox-gl";
import { useMap } from "react-map-gl";
import IconButton from "./IconButton";

export function Download() {
    const { current: map } = useMap();
    const { data: activeLayers } = useLayersFromRW();
    if (!map) return null;
    function getFeatures() {
        const layerIds = activeLayers.map((layer) => layer.id);
        const layers = map
            ?.getStyle()
            .layers.filter(isDataLayer)
            .filter((layer) => layerIds.includes(layer.source as string))
            .map((layer) => layer.id);
        const features = map
            ?.queryRenderedFeatures(undefined, { layers: layers ? layers : [] })
            .map((feature) => feature.properties);
        alert(JSON.stringify(features));
    }
    return <IconButton onClick={() => getFeatures()}><DownloadIcon /></IconButton>;
}

function isDataLayer(
    layer: AnyLayer
): layer is FillLayer | LineLayer | RasterLayer | SymbolLayer | CircleLayer {
    return (
        (layer as CircleLayer | FillLayer | LineLayer | RasterLayer | SymbolLayer)
            .source !== undefined
    );
}

function DownloadIcon() {
    return <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 17.2852V19.5352C3 20.1319 3.23705 20.7042 3.65901 21.1261C4.08097 21.5481 4.65326 21.7852 5.25 21.7852H18.75C19.3467 21.7852 19.919 21.5481 20.341 21.1261C20.7629 20.7042 21 20.1319 21 19.5352V17.2852M16.5 12.7852L12 17.2852M12 17.2852L7.5 12.7852M12 17.2852V3.78516" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
}

