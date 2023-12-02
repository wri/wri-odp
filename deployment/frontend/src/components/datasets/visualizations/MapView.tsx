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
            layers: ['0237e906-8a57-4c10-9403-6b14be42d89f'],
            datasetId: '',
        })
    }, [])

    return <Map layers={activeLayers} onClickAddLayers={() => setIsAddLayers(prev => !prev)} />
}
