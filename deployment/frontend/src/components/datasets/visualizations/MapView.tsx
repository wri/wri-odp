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
            layers: ['173d4c5b-28fa-4db5-984c-4498709c8ad2'],
            datasetId: '',
        })
    }, [])

    return <Map layers={activeLayers} onClickAddLayers={() => setIsAddLayers(prev => !prev)} />
}
