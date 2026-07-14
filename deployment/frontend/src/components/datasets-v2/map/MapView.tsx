import Map from './Map';
import { useLayersFromRW } from '@/utils/queryHooks';

export default function MapView({
    isEmbedding = false,
    datasetId,
    layerRwId,
}: {
    isEmbedding?: boolean;
    datasetId?: string;
    layerRwId?: string | null;
}) {
    const { data: activeLayers } = useLayersFromRW();

    return (
        <Map
            layers={activeLayers}
            showLegends={false}
            mapHeight={isEmbedding ? '100vh' : 'calc(100vh - 48px)'}
            datasetId={datasetId}
            layerRwId={layerRwId}
        />
    );
}
