import { appRouter } from '@/server/api/root'
import { createServerSideHelpers } from '@trpc/react-query/server'
import superjson from 'superjson'
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import { NextSeo } from 'next-seo'
import Header from '@/components/_shared/Header'
import { Breadcrumbs } from '@/components/_shared/Breadcrumbs'
import { api } from '@/utils/api'
import { getServerAuthSession } from '@/server/auth'
import { P, match } from 'ts-pattern'
import EditDatasetForm from '@/components/dashboard/datasets/admin/EditDatasetForm'

export async function getServerSideProps(
    context: GetServerSidePropsContext<{ datasetName: string }>
) {
    const session = await getServerAuthSession(context)
    const helpers = createServerSideHelpers({
        router: appRouter,
        ctx: { session },
        transformer: superjson,
    })
    const datasetName = context.params?.datasetName as string
    await helpers.teams.getAllTeams.prefetch()
    await helpers.tags.getAllTags.prefetch()
    await helpers.topics.getTopicsHierarchy.prefetch()
    await helpers.dataset.getLicenses.prefetch()
    await helpers.dataset.getOneDataset.prefetch({ id: datasetName })
    await helpers.dataset.getDatasetCollaborators.prefetch({ id: datasetName })
    return {
        props: {
            trpcState: helpers.dehydrate(),
            datasetName,
        },
    }
}

export default function EditDatasetPage(
    props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
    const { datasetName } = props
    const dataset = api.dataset.getOneDataset.useQuery({
        id: datasetName,
    })
    const links = [
        { label: 'Dashboard', url: '/dashboard', current: false },
        { label: 'Datasets', url: '/dashboard/datasets', current: false },
        {
            label: `Edit ${dataset.data?.title ?? dataset.data?.name ?? ''}`,
            url: `/dashboard/datasets/${datasetName}/edit`,
            current: true,
        },
    ]

    return (
        <>
            <NextSeo title={`Edit Dataset - ${dataset.data?.title ?? dataset.data?.name ?? ''} `} />
            <Header />
            <Breadcrumbs links={links} />
            <div className='pt-8 pb-16'>
                <main className="flex flex-col justify-start gap-y-6 py-8">
                    <h1 className="mx-auto w-full font-acumin text-2xl font-semibold text-black max-w-[1380px] px-4  sm:px-6 xxl:px-0">
                        Edit Dataset
                    </h1>
                    {match(dataset)
                        .with({ data: undefined, error: null }, () => (
                            <div className="text-center">Loading...</div>
                        ))
                        .with(
                            { data: undefined, error: P.select('error') },
                            ({ error }) => (
                                <div className="text-center">
                                    {error.message}
                                </div>
                            )
                        )
                        .with({ data: P.select('data') }, ({ data }) => (
                            <EditDatasetForm dataset={data} />
                        ))
                        .otherwise(() => (
                            <span>
                                Something went wrong, please contact the system
                                administrator
                            </span>
                        ))}
                </main>
            </div>
        </>
    )
}
