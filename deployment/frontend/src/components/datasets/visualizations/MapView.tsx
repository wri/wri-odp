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
            layers: ['d5c3e961-9169-4923-b689-354b0aac10ca'],
            datasetId: '',
        })
    }, [])

    return <Map layers={activeLayers} onClickAddLayers={() => setIsAddLayers(prev => !prev)} />
}
