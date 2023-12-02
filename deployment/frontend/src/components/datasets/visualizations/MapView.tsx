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
            layers: ['f92d7d3d-608e-4fcf-91f3-5d005fe3b09f'],
            datasetId: '',
        })
    }, [])

    return <Map layers={activeLayers} onClickAddLayers={() => setIsAddLayers(prev => !prev)} />
}
