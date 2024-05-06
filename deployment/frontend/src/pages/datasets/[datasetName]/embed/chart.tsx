import { View } from '@/interfaces/dataset.interface'
import { getServerAuthSession } from '@/server/auth'
import { getDatasetView, getResourceView } from '@/utils/apiUtils'
import { GetServerSidePropsContext } from 'next'
import dynamic from 'next/dynamic'

const Chart = dynamic(
    () => import('@/components/datasets/visualizations/Chart'),
    { ssr: false }
)

export async function getServerSideProps(
    context: GetServerSidePropsContext<{ datasetName: string }>
) {
    const { chart_provider, chart_id } = context.query
    const session = await getServerAuthSession(context)

    try {
        let view: View

        if (chart_provider == 'datastore') {
            view = await getResourceView({ id: chart_id as string, session })
        } else {
            view = await getDatasetView({ id: chart_id as string })
        }

        if (!view) {
            throw 'View not found'
        }

        return {
            props: {
                view,
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

export default function Embed({ view }: { view: View }) {
    return <Chart config={view.config_obj.config} />
}
