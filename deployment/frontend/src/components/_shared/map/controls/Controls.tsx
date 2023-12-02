import type { MapRef } from 'react-map-gl'
import Zoom from './Zoom'
import type { MutableRefObject } from 'react'
import Search from './Search'
import Settings from './Settings'
import Draw from './Draw'
import { Download } from './Download'
import Export from './Export'

export default function Controls({
    mapRef,
    mapContainerRef,
}: {
    mapRef: MutableRefObject<MapRef | null>
    mapContainerRef: MutableRefObject<HTMLDivElement | null>
}) {
    return (
        <div className="absolute top-5 right-6 flex flex-col gap-y-1.5 rounded">
            <Zoom mapRef={mapRef} />
            <Search mapContainerRef={mapContainerRef} />
            <Settings mapRef={mapRef} />
            {/* <Draw
                mapRef={mapRef}
                onDraw={(feature) => {
                    console.log(feature)
                }}
            />
            <Download />
            <Export /> */}
        </div>
    )
}
