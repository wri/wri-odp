import Loading from '@/components/_shared/Loading'
import ChartView from '@/components/datasets/visualizations/ChartView'
import { getServerAuthSession } from '@/server/auth'
import { api } from '@/utils/api'
import { getOneDataset } from '@/utils/apiUtils'
import { useActiveDatafileCharts } from '@/utils/storeHooks'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export async function getServerSideProps(
    context: GetServerSidePropsContext<{ datasetName: string }>
) {
    const datasetName = context.params?.datasetName as string
    const session = await getServerAuthSession(context)
    try {
        const dataset = await getOneDataset(datasetName, session)

        return {
            props: {
                dataset: {
                    ...dataset,
                    spatial: dataset.spatial ?? null,
                },
                datasetName,
                initialZustandState: {
                    dataset,
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

export default function Embed({
    dataset,
    datasetName,
}: {
    dataset: any
    datasetName: string
}) {
    const {
        data: datasetData,
        error: datasetError,
        isLoading,
    } = api.dataset.getOneDataset.useQuery({ id: datasetName }, { retry: 0 })

    const { replaceDatafileCharts } = useActiveDatafileCharts()

    const router = useRouter()

    const { query } = router

    let { charts } = query

    charts = charts as string
    const urlDfIds = charts.split(',')

    useEffect(() => {
        if (datasetData) {
            const datafiles = datasetData.resources.filter((df) =>
                urlDfIds.includes(df.id)
            )

            replaceDatafileCharts(datafiles)
        }
    }, [datasetData])

    if (isLoading) return <Loading />

    return <ChartView isEmbed={true} />
}
