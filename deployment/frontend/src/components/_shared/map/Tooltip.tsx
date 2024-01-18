import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { Map, MapLayerMouseEvent } from "mapbox-gl";
import {
  LngLat,
  MapGeoJSONFeature,
} from "react-map-gl/dist/esm/types";
import { Popup } from "react-map-gl";
import { useLayersFromRW } from "@/utils/queryHooks";

export interface TooltipRef {
  onClickLayer: (e: MapLayerMouseEvent) => void | undefined;
  close: () => void;
}

export default forwardRef<TooltipRef>(function Tooltip({}, ref) {
  const { data: layers } = useLayersFromRW();
  const [coordinates, setCoordinates] = useState<
    { longitude: number; latitude: number } | undefined
  >();
  const [layersInfo, setLayersInfo] = useState<any>();
  useEffect(() => {
    close();
  }, [layers?.length]);

  const onClickLayer = useCallback(
    ({
      features,
      lngLat,
    }: {
      features?: MapGeoJSONFeature[];
      lngLat: LngLat;
    }) => {
      setCoordinates({ longitude: lngLat.lng, latitude: lngLat.lat });
      const layersInfo = [];
      for (let layer of layers) {
        const feature = features?.find(
          //  @ts-ignore
          (f) => (f?.source || f.layer?.source) === layer.id
        );
        const { interactionConfig } = layer;

        const layerInfo = {
          id: layer.id,
          name: layer.name,
        };

        if (feature && interactionConfig?.output) {
          //  TODO: output is supposed to be an array
          //  @ts-ignore
          layerInfo.properties = interactionConfig.output.map((c: any) => {
            return {
              config: c,
              //  TODO: c.column is supposed to be a string
              //  @ts-ignore
              value: feature.properties[c.column],
            };
          });
        }

        layersInfo.push(layerInfo);
      }
      setLayersInfo(layersInfo);
    },
    [layers]
  );

  const close = () => {
    setCoordinates(undefined);
    setLayersInfo(undefined);
  };

  useImperativeHandle(
    ref,
    () => {
      return {
        onClickLayer,
        close,
      };
    },
    [layers]
  );

  return !!coordinates ? (
    <Popup
      {...coordinates}
      closeButton
      closeOnClick={false}
      onClose={() => close()}
      maxWidth={"250px"}
    >
      {layersInfo.map((info: any, i: number) => {
        return (
          <div key={`tooltip-layer-${i}`} className="mb-5">
            <h1 className="font-semibold line-clamp-1 text-lg">{info.name}</h1>
            <div>
              {info.properties?.map((prop: any, j: number) => {
                return (
                  <p key={`tooltip-layer-${i}-prop-${j}`} className="text-sm">
                    <span className="font-semibold">
                      {prop.config.property || prop.config.column}:
                    </span>{" "}
                    {/* TODO: format value according to prop.config.format */}
                    {prop.value}
                  </p>
                );
              }) || (
                <p className="text-sm">No info found for this coordinate</p>
              )}
            </div>
          </div>
        );
      })}
    </Popup>
  ) : (
    <></>
  );
});
