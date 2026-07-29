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

const getDataFileSnippetBlock = ({
    resource,
    tab,
    ckanBaseUrl,
    rwBaseUrl,
}: {
    resource: Resource;
    tab: CodeTab;
    ckanBaseUrl: string;
    rwBaseUrl: string;
}) => {
    const buildSnippet = getSnippetBuilder(tab);
    const gfwBaseUrl = 'https://data-api.globalforestwatch.org';
    const rwLayerUrl = `${rwBaseUrl}/layer/${resource.rw_id}`;
    const sections: string[] = [];

    if (tab === 'javascript' || tab === 'python' || tab === 'r') {
        return buildSnippet(`${ckanBaseUrl}/resource_show?id=${resource.id}`);
    }

    const editBody = JSON.stringify(
        {
            id: resource.id,
            title: `${resource.title ?? resource.name ?? resource.id} -Edited`,
            description: `${resource.description ?? ''} Edited`,
        },
        null,
        4
    ).replace(/\n/g, `\n${' '.repeat(8)}`);

    sections.push(
        `Edit this Data File's metadata\n${buildSnippet(`${ckanBaseUrl}/resource_patch`, 'POST', editBody)}`
    );
    sections.push(
        `Get this Data File's metadata\n${buildSnippet(`${ckanBaseUrl}/resource_show?id=${resource.id}`)}`
    );

    if (resource.url) {
        if (resource.url.startsWith(gfwBaseUrl)) {
            sections.push(
                `Get raw file\n${buildSnippet(resource.url, 'GET', JSON.stringify({}), true)}`
            );
        } else {
            sections.push(`Get raw file\n${buildSnippet(resource.url)}`);
        }
    }

    if (resource.datastore_active) {
        sections.push(
            `Get this Data File's records metadata\n${buildSnippet(
                `${ckanBaseUrl}/datastore_info`,
                'POST',
                `{ "id": "${resource.id}" }`
            )}`
        );
        sections.push(
            `Search this Data File's records\n${buildSnippet(
                `${ckanBaseUrl}/datastore_search?resource_id=${resource.id}&q=foo`
            )}`
        );
        sections.push(
            `Run a SQL query against this Data File's records\n${buildSnippet(
                `${ckanBaseUrl}/datastore_search_sql?sql=SELECT * FROM "${resource.id}" LIMIT 10`
            )}`
        );
    }

    if (resource.rw_id) {
        sections.push(
            `Get the layer object associated with this Data File\n${buildSnippet(rwLayerUrl)}`
        );
    }

    return sections.join('\n');
};

export const getSnippetByEndpoint = ({
    endpoint,
    tab,
    ckanBaseUrl,
    rwBaseUrl,
}: {
    endpoint: EndpointItem;
    tab: CodeTab;
    ckanBaseUrl: string;
    rwBaseUrl: string;
}) => {
    if (endpoint.resource) {
        return getDataFileSnippetBlock({
            resource: endpoint.resource,
            tab,
            ckanBaseUrl,
            rwBaseUrl,
        });
    }

    const buildSnippet = getSnippetBuilder(tab);
    return buildSnippet(endpoint.url);
};
