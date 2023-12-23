import Map from '@/components/_shared/map/Map'
import { useLayersFromRW } from '@/utils/queryHooks'

export default function MapView({
    isEmbedding = false,
}: {
    isEmbedding?: boolean
}) {
    const { data: activeLayers } = useLayersFromRW()

    return (
        <div>
            <Map
                layers={activeLayers}
                mapHeight={isEmbedding ? '100vh' : 'calc(100vh - 63px)'}
            />
        </div>
    )
}
