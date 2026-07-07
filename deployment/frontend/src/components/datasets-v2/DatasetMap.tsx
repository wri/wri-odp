import MapView from './map/MapView';

function DatasetV2Map({ datasetId, layerRwId }: { datasetId: string; layerRwId: string | null }) {
    return <MapView datasetId={datasetId} layerRwId={layerRwId} />;
}

export default DatasetV2Map;
