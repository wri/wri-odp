import type { MutableRefObject } from 'react';
import type { MapRef } from 'react-map-gl';
import Zoom from '../../../icons/Zoom';
import Search from '../../../icons/Search';
import Settings from '../../../icons/Settings';
import Export from '../../../icons/Export';

export default function Controls({
    mapRef,
    mapContainerRef,
}: {
    mapRef: MutableRefObject<MapRef | null>;
    mapContainerRef: MutableRefObject<HTMLDivElement | null>;
}) {
    return (
        <div className="absolute top-5 right-6 flex flex-col gap-y-1.5 rounded">
            <Zoom mapRef={mapRef} />
            <Search mapContainerRef={mapContainerRef} />
            <Settings mapRef={mapRef} />
            <Export />
        </div>
    );
}
