import Map from '@/components/_shared/map/Map'
import { useLayersFromRW } from '@/utils/queryHooks'
import { useActiveLayerGroups } from '@/utils/storeHooks'
import { Dispatch, SetStateAction, useEffect } from 'react'

export default function MapView({
    setIsAddLayers,
}: {
    setIsAddLayers: Dispatch<SetStateAction<boolean>>
}) {
    const { data: activeLayers } = useLayersFromRW()
    const { addLayerGroup } = useActiveLayerGroups()

    useEffect(() => {
        addLayerGroup({
            layers: ['74306f01-3baa-4256-9cdc-694080cf6b13'],
            datasetId: '',
        })
    }, [])

    return <Map layers={activeLayers} onClickAddLayers={() => setIsAddLayers(prev => !prev)} />
}
