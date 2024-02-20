import { env } from '@/env.mjs'
import {
    RwLayerResp,
    RwResponse,
    isRwError,
    isRwLayerResp,
} from '@/interfaces/rw.interface'
import {
    convertFormToLayerObj,
    getApiSpecFromRawObj,
} from '@/components/dashboard/datasets/admin/datafiles/sections/BuildALayer/convertObjects'
import { DatasetFormType, ResourceFormType } from '@/schema/dataset.schema'

export const assertFullfilled = <T>(input: PromiseSettledResult<T>): input is PromiseFulfilledResult<T> => {
    return input.status === 'fulfilled';
}

export async function deleteLayerRw(r: ResourceFormType) {
    const layerRes = await fetch(
        r.url ?? '',
        {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${env.RW_API_KEY}`,
            },
        }
    )
    const layerRw: RwResponse = await layerRes.json()
    if (isRwError(layerRw)) throw new Error(JSON.stringify(layerRw.errors))
    return layerRw
}

export async function createDatasetRw(dataset: DatasetFormType) {
    const rwDataset: Record<string, any> = {
        name: dataset.title ?? '',
        connectorType: dataset.connectorType,
        provider: dataset.provider,
        published: false,
        env: 'staging',
        application: ['data-explorer'],
    }
    if (dataset.provider === 'gee') {
        rwDataset.tableName = dataset.tableName
    } else {
        rwDataset.connectorUrl = dataset.connectorUrl
    }
    const body = JSON.stringify({ dataset: rwDataset })
    const datasetRwRes = await fetch(
        'https://api.resourcewatch.org/v1/dataset',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${env.RW_API_KEY}`,
            },
            body,
        }
    )
    const datasetRw: RwResponse = await datasetRwRes.json()
    if (isRwError(datasetRw)) throw new Error(JSON.stringify(datasetRw.errors))
    return datasetRw
}

export async function createLayerRw(r: ResourceFormType, datasetRwId: string) {
    if (!r.layerObj && !r.layerObjRaw) return r
    const body = r.layerObj
        ? JSON.stringify(convertFormToLayerObj(r.layerObj))
        : JSON.stringify({
              ...getApiSpecFromRawObj(r.layerObjRaw),
          })
    const layerRwRes = await fetch(
        `https://api.resourcewatch.org/v1/dataset/${datasetRwId}/layer`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${env.RW_API_KEY}`,
            },
            body,
        }
    )
    const layerRw: RwResponse = await layerRwRes.json()
    if (isRwError(layerRw)) throw new Error(JSON.stringify(layerRw.errors))
    if (!isRwLayerResp(layerRw)) throw new Error('Invalid response from RW API')
    const url = `https://api.resourcewatch.org/v1/dataset/${layerRw.data.attributes.dataset}/layer/${layerRw.data.id}`
    const name = layerRw.data.id
    const title = layerRw.data.attributes.name
    const description = layerRw.data.attributes.description
    r.url = url
    r.name = name
    r.title = r.name !== '' ? r.name : title
    r.description = r.description !== '' ? r.description : description
    r.rw_id = layerRw.data.id
    r.format = 'Layer'
    return r
}

export async function editLayerRw(r: ResourceFormType) {
    if ((!r.layerObj && !r.layerObjRaw) || !r.rw_id) return r
    try {
        if ((r.layerObj || r.layerObjRaw) && r.url) {
            const body = r.layerObj
                ? JSON.stringify(convertFormToLayerObj(r.layerObj))
                : JSON.stringify(getApiSpecFromRawObj(r.layerObjRaw))
            const layerRwRes = await fetch(r.url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${env.RW_API_KEY}`,
                },
                body,
            })
            const layerRw: RwResponse = await layerRwRes.json()
            if (isRwError(layerRw))
                throw Error(
                    `Error creating resource at the Resource Watch API - (${JSON.stringify(
                        layerRw.errors
                    )})`
                )
            const title = layerRw.data.attributes.name
            const description = layerRw.data.attributes.description
            r.title = r.title !== '' ? r.title : title
            r.description = r.description !== '' ? r.description : description
            r.format = 'Layer'
            return r
        }
    } catch (e) {
        let error =
            'Something went wrong when we tried to create some resources in the Resource Watch API please contact the system administrator'
        if (e instanceof Error) error = e.message
        throw Error(error)
    }
    return r
}


