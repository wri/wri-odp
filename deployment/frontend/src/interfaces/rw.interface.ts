import { APILayerSpec } from './layer.interface'

export const isRwError = (
    resp: RwLayerResp | RwDatasetResp | RwErrorResponse
): resp is RwErrorResponse => {
    return (resp as RwErrorResponse).errors !== undefined
}

export type RwResponse = RwLayerResp | RwDatasetResp | RwErrorResponse

export interface RwLayerResp {
    data: {
        id: string
        attributes: RwDataset
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
    tableName: string
    status: string
    published: boolean
    env: string
}
