import { Breadcrumbs } from '@/components/_shared/Breadcrumbs'
import Header from '@/components/_shared/Header'
import { DatasetHeader } from '@/components/datasets/DatasetHeader'
import DatasetPageLayout from '@/components/datasets/DatasetPageLayout'
import { DatasetTabs } from '@/components/datasets/DatasetTabs'
import { API } from '@/components/datasets/sections/API'
import { About } from '@/components/datasets/sections/About'
import { Contact } from '@/components/datasets/sections/Contact'
import { DataFiles } from '@/components/datasets/sections/DataFiles'
import { Members } from '@/components/datasets/sections/Members'
import { Methodology } from '@/components/datasets/sections/Methodology'
import { RelatedDatasets } from '@/components/datasets/sections/RelatedDatasets'
import { Tab } from '@headlessui/react'
import Visualizations from '@/components/datasets/visualizations/Visualizations'
import { useState } from 'react'
import AddLayers from '@/components/datasets/add-layers/AddLayers'
import Issues from '@/components/datasets/sections/Issues'
import ApprovalRequestCard from '@/components/datasets/ApprovalRequestCard'
import { useRouter } from 'next/router'
import { api } from '@/utils/api'
import { ErrorAlert } from '@/components/_shared/Alerts'
import { createServerSideHelpers } from '@trpc/react-query/server'
import { appRouter } from '@/server/api/root'
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import superjson from 'superjson'
import Spinner from '@/components/_shared/Spinner'
import { Button } from '@/components/_shared/Button'
import Link from 'next/link'
import { NextSeo } from 'next-seo'

const links = [
    { label: 'Explore Data', url: '/search', current: false },
    { label: 'Name of dataset', url: '/datasets/dataset_test', current: true },
]

export async function getServerSideProps(
    context: GetServerSidePropsContext<{ datasetName: string }>
) {
    const helpers = createServerSideHelpers({
        router: appRouter,
        ctx: { session: null },
        transformer: superjson,
    })
    const datasetName = context.params?.datasetName as string
    await helpers.dataset.getOneDataset.prefetch({ id: datasetName })

    return {
        props: {
            trpcState: helpers.dehydrate(),
            datasetName,
        },
    }
}

export default function DatasetPage(
    props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
    const { datasetName } = props
    const { query } = useRouter()
    const isApprovalRequest = query?.approval === 'true'
    const [isAddLayers, setIsAddLayers] = useState(false)
    const {
        data: datasetData,
        error: datasetError,
        isLoading,
    } = api.dataset.getOneDataset.useQuery({ id: datasetName }, { retry: 0 })

    const tabs = [
        { name: 'Data files' },
        { name: 'About' },
        { name: 'Methodology' },
        { name: 'Related Datasets' },
        { name: 'Contact' },
        { name: 'API' },
        { name: 'Members' },
        { name: 'Issues', count: 1 },
    ]

    if (isLoading && !datasetData) {
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
            <NextSeo
                title={`${datasetData?.title ?? datasetData?.name} - Datasets`}
            />
            <Header />
            <Breadcrumbs links={links} />
            {isApprovalRequest && <ApprovalRequestCard />}
            <DatasetPageLayout
                lhs={
                    isAddLayers ? (
                        <AddLayers />
                    ) : (
                        <>
                            <DatasetHeader />
                            <Tab.Group as="div">
                                <Tab.List
                                    as="nav"
                                    className="flex w-full gap-x-2 border-b border-zinc-300"
                                >
                                    <DatasetTabs tabs={tabs} />
                                </Tab.List>
                                <div className="mb-4 mr-9" />
                                <div>
                                    <Tab.Panels as="div">
                                        <Tab.Panel as="div">
                                            <DataFiles />
                                        </Tab.Panel>
                                        <Tab.Panel as="div">
                                            <About />
                                        </Tab.Panel>
                                        <Tab.Panel as="div">
                                            <Methodology />
                                        </Tab.Panel>
                                        <Tab.Panel as="div">
                                            <RelatedDatasets />
                                        </Tab.Panel>
                                        <Tab.Panel as="div">
                                            <Contact />
                                        </Tab.Panel>
                                        <Tab.Panel as="div">
                                            <API />
                                        </Tab.Panel>
                                        <Tab.Panel as="div">
                                            <Members />
                                        </Tab.Panel>
                                        <Tab.Panel as="div">
                                            <Issues />
                                        </Tab.Panel>
                                    </Tab.Panels>
                                </div>
                            </Tab.Group>
                        </>
                    )
                }
                rhs={<Visualizations setIsAddLayers={setIsAddLayers} />}
            />
        </>
    )
}
