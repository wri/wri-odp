import Map from '@/components/_shared/map/Map'
import { useLayersFromRW } from '@/utils/queryHooks'
import { Dispatch, SetStateAction, useEffect } from 'react'

export default function MapView({
    setIsAddLayers,
}: {
    setIsAddLayers: Dispatch<SetStateAction<boolean>>
}) {
    const { data: activeLayers } = useLayersFromRW()

    return (
        <div>
            <Map
                layers={activeLayers}
                onClickAddLayers={() => setIsAddLayers((prev) => !prev)}
            />
        </div>
    )
}
