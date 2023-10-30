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
import {DownloadIcon} from "../../icons/DownloadIcon";

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


