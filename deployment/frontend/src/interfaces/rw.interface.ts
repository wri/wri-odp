import { APILayerSpec } from './layer.interface'

export const isRwError = (
    resp: RwLayerResp | RwDatasetResp | RwErrorResponse
): resp is RwErrorResponse => {
    return (resp as RwErrorResponse).errors !== undefined
}

export const isRwLayerResp = (
    resp: RwLayerResp | RwDatasetResp
): resp is RwLayerResp => {
    return (resp as RwLayerResp).data.attributes.dataset !== undefined
}

export type RwResponse = RwLayerResp | RwDatasetResp | RwErrorResponse

export interface RwLayerResp {
    data: {
        id: string
        attributes: APILayerSpec
    }
}

export interface RwDatasetResp {
    data: {
        id: string
        attributes: RwDataset
    }
}

export interface RwErrorResponse {
    errors: any
}

export interface RwDataset {
    name: string
    slug: string
    type: string
    subtitle?: string
    description?: string
    application: string[]
    connectorType: string
    provider: string
    userId: string
    connectorUrl: string
    sources: string[]
    tableName: string
    status: string
    published: boolean
    env: string
}
