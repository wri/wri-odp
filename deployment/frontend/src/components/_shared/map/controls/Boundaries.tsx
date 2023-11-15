import React, { type MutableRefObject, useCallback, useEffect } from "react";
import { type MapRef } from "react-map-gl";
import {type Map as MapType} from "mapbox-gl";
import type mapboxgl from "mapbox-gl";
import { useBoundaries } from "@/utils/storeHooks";

const Boundaries = ({
  mapRef,
}: {
  mapRef: MutableRefObject<MapRef | null>;
}) => {
  const { showBoundaries, setShowBoundaries } = useBoundaries();

  const handleBoundariesToggle = () => {
    setShowBoundaries(!showBoundaries);
  };

  const handleBoundaries = useCallback(
    (boundaries: boolean) => {
      const map = mapRef.current as unknown as MapType;
      const LABELS_GROUP = ["boundaries"];
      const { layers, metadata } = map.getStyle();

      const boundariesGroups = Object.keys(metadata["mapbox:groups"]).filter(
        (k) => {
          const { name } = metadata["mapbox:groups"][k];

          const labelsGroup = LABELS_GROUP.map((rgr) =>
            name.toLowerCase().includes(rgr)
          );

          return labelsGroup.some((bool) => bool);
        }
      );

      const boundariesLayers = layers.filter((l: mapboxgl.Layer) => {
        const { metadata: layerMetadata } = l;
        if (!layerMetadata) return false;

        const gr = layerMetadata["mapbox:group"];
        return boundariesGroups.includes(gr);
      });

      boundariesLayers.forEach((l) => {
        map.setLayoutProperty(
          l.id,
          "visibility",
          boundaries ? "visible" : "none"
        );
      });
    },
    [mapRef]
  );

  useEffect(() => {
    handleBoundaries(showBoundaries);
  }, [showBoundaries, handleBoundaries]);

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={showBoundaries}
          onChange={handleBoundariesToggle}
        />
        <span className="ml-2">Show boundaries</span>
      </label>
    </div>
  );
};

export default Boundaries;

