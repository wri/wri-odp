import { Breadcrumbs } from '@/components/_shared/Breadcrumbs'
import Header from '@/components/_shared/Header'
import { useRouter } from 'next/router'
import { api } from '@/utils/api'
import dynamic from 'next/dynamic'
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import Spinner from '@/components/_shared/Spinner'
import { useSession } from 'next-auth/react'
import { getOneDataset } from '@/utils/apiUtils'
import { getServerAuthSession } from '@/server/auth'

import { decodeMapParam } from '@/utils/urlEncoding'

const LazyViz = dynamic(
    () => import('@/components/datasets/visualizations/MapView'),
    {
        loading: () => (
            <div className="min-h-[90vh] bg-lima-700 opacity-75 flex-col items-center justify-center">
                <Spinner className="text-wri-green w-12 h-12" />
                <h2 className="text-center text-xl font-semibold text-wri-green">
                    Loading...
                </h2>
            </div>
        ),
    }
)

export async function getServerSideProps(
    context: GetServerSidePropsContext<{ datasetName: string }>
) {
    const { query } = context
    const { map } = query
    const mapState = decodeMapParam(map as string)

    const datasetName = context.params?.datasetName as string
    const session = await getServerAuthSession(context)
    try {
        let dataset = await getOneDataset(datasetName, session)
        // remove layerObj and layerObjRaw from resources (makes page faster + avoids serializing errors )
        dataset = {...dataset, resources: dataset.resources.map(r => ({...r, layerObj: null, layerObjRaw: null }))}

        return {
            props: {
                dataset: {
                    ...dataset,
                    spatial: dataset.spatial ?? null,
                },
                datasetName,
                initialZustandState: {
                    dataset,
                    mapView: { ...mapState, isEmbedding: true },
                },
            },
        }
    } catch {
        return {
            props: {
                redirect: {
                    destination: '/datasets/404',
                },
            },
        }
    }
}

export default function DatasetPage(
    props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
    const { dataset } = props

    const datasetName = props.datasetName as string
    const router = useRouter()
    const { query } = router
    const isApprovalRequest = query?.approval === 'true'
    const session = useSession()
    const {
        data: datasetData,
        error: datasetError,
        isLoading,
    } = api.dataset.getOneDataset.useQuery(
        { id: datasetName },
        { retry: 0, initialData: dataset }
    )
    if (!datasetData && datasetError) router.replace('/datasets/404')
    const relatedDatasets = api.dataset.getAllDataset.useQuery({
        fq: {
            groups:
                datasetData?.groups?.map((group) => group.name).join(' OR ') ??
                '',
        },
    })
    const collaborators = api.dataset.getDatasetCollaborators.useQuery(
        { id: datasetName },
        { enabled: !!session.data?.user.apikey }
    )
    const issues = api.dataset.getDatasetIssues.useQuery(
        { id: datasetName },
        { enabled: !!session.data?.user.apikey }
    )

    const links = [
        { label: 'Explore Data', url: '/search', current: false },
        {
            label: datasetData?.title ?? datasetData?.name ?? '',
            url: `/datasets/${datasetData?.title ?? datasetData?.name ?? ''}`,
            current: true,
        },
    ]
    if (isLoading || !datasetData) {
        return (
            <>
                <Header />
                <Breadcrumbs links={links} />
                <div className="flex flex-col items-center justify-center w-full h-[90vh]">
                    <Spinner /> Loading
                </div>
            </>
        )
    }

    return (
        <>
            <LazyViz isEmbedding={true} />
        </>
    )
}
