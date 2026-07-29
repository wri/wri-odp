import { type Resource } from '@/interfaces/dataset.interface';
import { type WriDataset } from '@/schema/ckan.schema';
import {
    getJsSnippet,
    getPythonSnippet,
    getRSnippet,
} from '@/components/datasets/sections/APIEndpoint';

export type CodeTab = 'javascript' | 'python' | 'r';

export type EndpointItem = {
    title: string;
    description: string;
    url: string;
    resource?: Resource;
};

export const normalizeBaseUrl = (url: string) => (url.endsWith('/') ? url.slice(0, -1) : url);

export const buildEndpoints = ({
    dataset,
    ckanBaseUrl,
    rwBaseUrl,
    tableName,
}: {
    dataset: WriDataset;
    ckanBaseUrl: string;
    rwBaseUrl: string;
    tableName?: string;
}): EndpointItem[] => {
    const ckanDatasetGetUrl = `${ckanBaseUrl}/package_show?id=${dataset.name}`;
    const rwDatasetGetUrl = `${rwBaseUrl}/dataset/${dataset.rw_id}`;
    const rwFieldsUrl = `${rwBaseUrl}/fields/${dataset.rw_id}`;
    const rwQueryUrl = `${rwBaseUrl}/query/${dataset.rw_id}?sql=SELECT * FROM ${tableName} LIMIT 10`;

    const dataFileEndpoints: EndpointItem[] = dataset.resources.map((resource) => ({
        title: `Data File metadata: ${resource.title ?? resource.name ?? resource.id}`,
        description: "Get this Data File's metadata.",
        url: `${ckanBaseUrl}/resource_show?id=${resource.id}`,
        resource,
    }));

    return [
        {
            title: 'Dataset metadata',
            description: "Get this dataset's metadata.",
            url: ckanDatasetGetUrl,
        },
        ...(dataset.rw_id
            ? [
                  {
                      title: 'RW dataset metadata',
                      description:
                          'Get the metadata stored on the Resource Watch API for this dataset.',
                      url: rwDatasetGetUrl,
                  },
              ]
            : []),
        ...(dataset.rw_id && dataset.provider
            ? [
                  {
                      title: 'Records metadata',
                      description: "Get this dataset's records metadata.",
                      url: rwFieldsUrl,
                  },
                  {
                      title: 'SQL query',
                      description: "Run a SQL query against this dataset's records.",
                      url: rwQueryUrl,
                  },
              ]
            : []),
        ...dataFileEndpoints,
    ];
};

const getSnippetBuilder = (tab: CodeTab) => {
    if (tab === 'javascript') {
        return getJsSnippet;
    }
    if (tab === 'python') {
        return getPythonSnippet;
    }
    return getRSnippet;
};

export const getSnippetByEndpoint = ({
    endpoint,
    tab,
    ckanBaseUrl,
}: {
    endpoint: EndpointItem;
    tab: CodeTab;
    ckanBaseUrl: string;
}) => {
    const buildSnippet = getSnippetBuilder(tab);

    if (endpoint.resource) {
        return buildSnippet(`${ckanBaseUrl}/resource_show?id=${endpoint.resource.id}`);
    }

    return buildSnippet(endpoint.url);
};
