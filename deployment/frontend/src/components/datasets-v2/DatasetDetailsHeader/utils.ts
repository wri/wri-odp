import type { DatasetDetailsHeaderDataset, DatasetDetailsHeaderMenuItem } from './types';

export function normalizeOpenInItems(
    dataset?: DatasetDetailsHeaderDataset
): DatasetDetailsHeaderMenuItem[] {
    const baseOpenIn = (dataset?.open_in ?? []).map((item: { title: string; url: string }) => ({
        label: item.title,
        value: item.url,
    }));

    const providerOpenIn: DatasetDetailsHeaderMenuItem[] =
        dataset?.provider === 'cartodb' && dataset.connectorUrl
            ? [{ label: 'Carto', value: dataset.connectorUrl }]
            : dataset?.provider === 'featureservice' && dataset.connectorUrl
              ? [{ label: 'ArcGIS', value: dataset.connectorUrl }]
              : dataset?.provider === 'gfw' && dataset.connectorUrl
                ? [{ label: 'GFW', value: dataset.connectorUrl }]
                : dataset?.provider === 'gee' && dataset.tableName
                  ? [
                        {
                            label: 'GEE',
                            value: `https://developers.google.com/earth-engine/datasets/catalog/${dataset.tableName.replaceAll('/', '_')}`,
                        },
                    ]
                  : (dataset?.sources ?? []).map((source, index) => ({
                        label:
                            (dataset?.sources?.length ?? 0) === 1
                                ? (dataset?.provider?.toUpperCase() ?? 'SOURCE')
                                : `Source ${index + 1}`,
                        value: source,
                    }));

    return [...baseOpenIn, ...providerOpenIn];
}
