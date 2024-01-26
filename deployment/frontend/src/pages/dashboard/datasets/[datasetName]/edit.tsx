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
import { useRouter } from 'next/router'
import Modal from '@/components/_shared/Modal'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Dialog } from '@headlessui/react'
import notify from '@/utils/notify'
import { Button, LoaderButton } from '@/components/_shared/Button'
import { useState } from 'react'
import Container from '@/components/_shared/Container'

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
    const [deleteOpen, setDeleteOpen] = useState(false)
    const router = useRouter()
    const utils = api.useContext()
    const dataset = api.dataset.getOneDataset.useQuery({
        id: datasetName,
        includeViews: true
    })
    const deleteDataset = api.dataset.deleteDataset.useMutation({
        onSuccess: async () => {
            await utils.dataset.getOneDataset.invalidate({ id: datasetName })
            setDeleteOpen(false)
            notify(
                `Successfully deleted the ${
                    dataset.data?.name ?? datasetName
                } dataset`,
                'error'
            )
            router.push('/dashboard/datasets')
        },
        onError: (error) => {
            console.log('Delete error', error)
            setDeleteOpen(false)
        },
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
            <Modal
                open={deleteOpen}
                setOpen={setDeleteOpen}
                className="sm:w-full sm:max-w-lg"
            >
                <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <ExclamationTriangleIcon
                            className="h-6 w-6 text-red-600"
                            aria-hidden="true"
                        />
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                        <Dialog.Title
                            as="h3"
                            className="text-base font-semibold leading-6 text-gray-900"
                        >
                            Delete Dataset
                        </Dialog.Title>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500">
                                Are you sure you want to delete this dataset?
                            </p>
                        </div>
                    </div>
                </div>
                <div className="mt-5 sm:mt-4 gap-x-4 sm:flex sm:flex-row-reverse">
                    <LoaderButton
                        variant="destructive"
                        loading={deleteDataset.isLoading}
                        onClick={() => deleteDataset.mutate(datasetName)}
                    >
                        Delete Dataset
                    </LoaderButton>
                    <Button
                        variant="outline"
                        type="button"
                        onClick={() => setDeleteOpen(false)}
                    >
                        Cancel
                    </Button>
                </div>
            </Modal>
            <NextSeo
                title={`Edit Dataset - ${
                    dataset.data?.title ?? dataset.data?.name ?? ''
                } `}
            />
            <Header />
            <Breadcrumbs links={links} />
            <div className="pt-8 pb-16">
                <main className="flex flex-col justify-start gap-y-6 py-8">
                    <div
                        className="flex justify-between
                        w-full max-w-[1380px] mx-auto px-4 sm:px-6 xxl:px-0"
                    >
                        <h1 className="mx-auto w-full font-acumin text-2xl font-semibold text-black max-w-[1380px] px-4  sm:px-6 xxl:px-0">
                            Edit Dataset
                        </h1>
                        <Button
                            variant="destructive"
                            className="whitespace-nowrap"
                            onClick={() => setDeleteOpen(true)}
                        >
                            Delete Dataset
                        </Button>
                    </div>
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
