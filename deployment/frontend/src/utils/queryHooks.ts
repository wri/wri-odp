/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { CKAN } from '@portaljs/ckan'
import { useQuery } from 'react-query'
import flatten from 'lodash/flatten'
import compact from 'lodash/compact'
import isEmpty from 'lodash/isEmpty'
import { APILayerSpec } from '@/interfaces/layer.interface'
import {
    useActiveLayerGroups,
    useLayerStates,
    useLayerAsLayerObj,
} from './storeHooks'
import { ActiveLayerGroup, LayerState } from '@/interfaces/state.interface'
import { env } from '@/env.mjs'
import { useSession } from 'next-auth/react'
import { type Session } from 'next-auth'
import { convertFormToLayerObj } from '@/components/dashboard/datasets/admin/datafiles/sections/BuildALayer/convertObjects'
import { Resource } from '@/interfaces/dataset.interface'
import { getDecodeParams } from './decodeFunctions'

export async function packageSearch() {
    const ckan = new CKAN('https://ckan.x.demo.datopian.com')
    return await ckan.packageSearch({
        query: '',
        offset: 0,
        limit: 30,
        groups: [],
        orgs: [],
        tags: [],
    })
}

export const useDatasetsQuery = () => {
    return useQuery({
        queryKey: ['datasets'],
        queryFn: packageSearch,
    })
}

export async function getLayersFromRW(
    queryKey: any,
    currentLayers: Map<string, LayerState>,
    layerAsLayerObj: Map<string, string>,
    session: Session | null
) {
    const [, activeLayerGroups] = queryKey
    if (activeLayerGroups.length === 0) return []
    let countdown = 10
    const apikey = session?.user?.apikey ?? ''

    return await Promise.all(
        activeLayerGroups.map(
            async (layerGroup: ActiveLayerGroup, index: number) => {
                const { datasetId, layers } = layerGroup
                if (layers.length === 0) return []
                const layersData = await Promise.all(
                    layers.map(async (layer: string) => {
                        layer = layer.replace('prev', '')
                        let layerInfo = layerAsLayerObj.get(layer)
                        layerInfo = layerInfo ?? 'approved'
                        if (layerInfo === 'approved') {
                            const response = await fetch(
                                `https://api.resourcewatch.org/v1/layer/${layer}`
                            )
                            const layerData = await response.json()
                            const { id, attributes } = layerData.data
                            const currentLayer = currentLayers.get(id)
                            let decodeParams = null
                            if (
                                attributes.layerConfig.decode_config &&
                                getDecodeParams[
                                    id as keyof typeof getDecodeParams
                                ] !== undefined
                            ) {
                                decodeParams = await (
                                    getDecodeParams[
                                        id as keyof typeof getDecodeParams
                                    ] as any
                                )()
                            }
                            return {
                                id: id,
                                ...attributes,
                                layerConfig: {
                                    ...attributes.layerConfig,
                                    decodeParams,
                                    zIndex: countdown - index,
                                    visibility:
                                        layers.length > 1
                                            ? attributes.default
                                            : true,
                                    ...currentLayer,
                                    _ogSource: attributes.layerConfig.source,
                                },
                                active:
                                    layers.length > 1
                                        ? attributes.default
                                        : true,
                            }
                        } else if (layerInfo === 'pending') {
                            // something here
                            const fieldsRes = await fetch(
                                `${env.NEXT_PUBLIC_CKAN_URL}/api/3/action/pending_dataset_show?package_id=${datasetId}`,
                                {
                                    headers: {
                                        Authorization: apikey,
                                        'Content-Type': 'application/json',
                                    },
                                }
                            )
                            const responseData = await fieldsRes.json()

                            const resourcePackage = responseData.result[
                                'package_data'
                            ]['resources'] as Resource[]
                            const layerdata = resourcePackage.filter(
                                (l) => l.id === layer
                            )

                            const resource = layerdata[0]!

                            const resourceLayer =
                                resource.layerObj ?? resource.layerObjRaw
                            const currentLayer = currentLayers.get(resource.id)
                            const layerPackage = {
                                ...resourceLayer,
                                id: resource.id,
                                layerConfig: {
                                    ...resourceLayer?.layerConfig,
                                    zIndex: countdown - index,
                                    visibility:
                                        layers.length > 1
                                            ? resourceLayer?.default
                                            : true,
                                    ...currentLayer,
                                    _ogSource:
                                        resourceLayer?.layerConfig.source,
                                },
                                active:
                                    layers.length > 1
                                        ? resourceLayer?.default
                                        : true,
                            }
                            return layerPackage
                        } else {
                            // for prevdataset
                            const fieldsRes = await fetch(
                                `${env.NEXT_PUBLIC_CKAN_URL}/api/3/action/resource_show?id=${layer}`,
                                {
                                    headers: {
                                        Authorization: apikey,
                                        'Content-Type': 'application/json',
                                    },
                                }
                            )
                            const responseData = await fieldsRes.json()

                            const resource = responseData.result
                            const resourceLayer =
                                resource.layerObj ?? resource.layerObjRaw
                            const currentLayer = currentLayers.get(resource.id)
                            const layerPackage = {
                                ...resourceLayer,
                                id: resource.id,
                                layerConfig: {
                                    ...resourceLayer.layerConfig,
                                    zIndex: countdown - index,
                                    visibility:
                                        layers.length > 1
                                            ? resourceLayer.default
                                            : true,
                                    ...currentLayer,
                                    _ogSource: resourceLayer.layerConfig.source,
                                },
                                active:
                                    layers.length > 1
                                        ? resourceLayer.default
                                        : true,
                            }

                            return layerPackage
                        }
                    })
                )
                return {
                    dataset: datasetId,
                    layers: layersData,
                }
            }
        )
    )
}

export const useLayerGroupsFromRW = () => {
    const { activeLayerGroups } = useActiveLayerGroups()
    const { currentLayers } = useLayerStates()
    const { layerAsLayerObj } = useLayerAsLayerObj()
    const { data: session } = useSession()
    return useQuery({
        queryKey: ['layers', activeLayerGroups],
        queryFn: ({ queryKey }) =>
            getLayersFromRW(queryKey, currentLayers, layerAsLayerObj, session),
    })
}

export const useLayersFromRW = () => {
    const result = useLayerGroupsFromRW()

    if (result.data) {
        const data: APILayerSpec[] = result.data
            .filter((lg) => lg.layers?.length > 0)
            .reduce((acc: any, layerGroup: any) => {
                return [...acc, ...layerGroup.layers]
            }, [])
        return { ...result, data }
    }
    return { ...result, data: [] }
}

/**
 *
 * @param {object[]} activeLayers Array of layers that mean to be interactive
 * @returns {string[]} Array of Mapbox layers ids that mean to be interactive
 */
export function getInteractiveLayers(activeLayers: any): string[] | null {
    return flatten(
        compact(
            activeLayers.map((_activeLayer: any) => {
                const { id, layerConfig } = _activeLayer
                if (isEmpty(layerConfig)) return null

                // * keeps backward compatibility for now
                const vectorLayers =
                    layerConfig.render?.layers || layerConfig.body?.vectorLayers

                if (vectorLayers) {
                    return vectorLayers.map((l: any, i: number) => {
                        const { id: vectorLayerId, type: vectorLayerType } = l
                        return vectorLayerId || `${id}-${vectorLayerType}-${i}`
                    })
                }
                return null
            })
        )
    )
}

export const useInteractiveLayers = () => {
    const result = useLayersFromRW()
    if (result.data) {
        const data = getInteractiveLayers(result.data)
        return { ...result, data }
    }
    return { ...result, data: [] }
}
