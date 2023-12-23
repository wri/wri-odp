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
import { useState } from 'react'
import AddLayers from '@/components/datasets/add-layers/AddLayers'
import Issues from '@/components/datasets/sections/Issues'
import ApprovalRequestCard from '@/components/datasets/ApprovalRequestCard'
import { useRouter } from 'next/router'
import { api } from '@/utils/api'
import dynamic from 'next/dynamic'
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import Spinner from '@/components/_shared/Spinner'
import { Index } from 'flexsearch'
import { useSession } from 'next-auth/react'
import { NextSeo } from 'next-seo'
import { getOneDataset } from '@/utils/apiUtils'
import { getServerAuthSession } from '@/server/auth'

import { decodeMapParam } from '@/utils/urlEncoding'
import SyncUrl from '@/components/_shared/map/SyncUrl'
import { useIsAddingLayers } from '@/utils/storeHooks'
import { TabularResource } from '@/components/datasets/visualizations/Visualizations'

const LazyViz = dynamic(
    () => import('@/components/datasets/visualizations/Visualizations'),
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
        const dataset = await getOneDataset(datasetName, session)

        return {
            props: {
                dataset: {
                    ...dataset,
                    spatial: dataset.spatial ?? null,
                },
                datasetName,
                initialZustandState: { dataset, mapView: mapState },
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
    const { isAddingLayers, setIsAddingLayers } = useIsAddingLayers()
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
        fq:
            datasetData?.groups && datasetData.groups.length > 0
                ? {
                      groups:
                          datasetData?.groups
                              ?.map((group) => group.name)
                              .join(' OR ') ?? '',
                  }
                : {},
    })

    const collaborators = api.dataset.getDatasetCollaborators.useQuery(
        { id: datasetName },
        { enabled: !!session.data?.user.apikey, retry: false }
    )
    const issues = api.dataset.getDatasetIssues.useQuery(
        { id: datasetName },
        { enabled: !!session.data?.user.apikey, retry: false }
    )

    const [tabularResource, setTabularResource] =
        useState<TabularResource | null>(null)

    const index = new Index({
        tokenize: 'full',
    })
    datasetData?.resources?.forEach((resource) => {
        index.add(
            resource.id,
            `${resource.description} ${resource.format} ${resource.url} ${resource.title}`
        )
    })
    const indexIssues = new Index({
        tokenize: 'full',
    })
    if (issues.data) {
        issues.data.forEach((issue) => {
            indexIssues.add(
                issue.id,
                `${issue.description} ${issue.title} ${issue.comments
                    .map((comment) => comment.comment)
                    .join(' ')}`
            )
        })
    }

    const tabs = [
        { name: 'Data files', enabled: true },
        { name: 'About', enabled: true },
        { name: 'Methodology', enabled: !!datasetData?.methodology },
        { name: 'Related Datasets', enabled: true },
        { name: 'Contact', enabled: true },
        { name: 'API', enabled: true },
        {
            name: 'Collaborators',
            enabled: collaborators.data,
        },
        {
            name: 'Issues',
            count: issues.data ? issues.data.length : undefined,
            enabled: issues.data && issues.data.length > 0,
        },
    ]
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
            <SyncUrl />
            <NextSeo
                title={`${datasetData?.title ?? datasetData?.name} - Datasets`}
            />
            <Header />
            <Breadcrumbs links={links} />
            {isApprovalRequest && <ApprovalRequestCard />}
            <DatasetPageLayout
                lhs={
                    isAddingLayers ? (
                        <div className="px-4 sm:px-6">
                            <AddLayers />
                        </div>
                    ) : (
                        <>
                            <DatasetHeader
                                dataset={datasetData}
                                tabularResource={tabularResource}
                                setTabularResource={setTabularResource}
                            />
                            <div className="px-4 sm:px-6">
                                <Tab.Group as="div">
                                    <Tab.List
                                        as="nav"
                                        className="flex w-full gap-x-2 border-b border-zinc-300"
                                    >
                                        <DatasetTabs
                                            tabs={tabs.filter(
                                                (tab) => tab.enabled
                                            )}
                                        />
                                    </Tab.List>
                                    <div className="mb-4 mr-9" />
                                    <div>
                                        <Tab.Panels as="div">
                                            <Tab.Panel as="div">
                                                <DataFiles
                                                    dataset={datasetData}
                                                    index={index}
                                                    tabularResource={
                                                        tabularResource
                                                    }
                                                    setTabularResource={
                                                        setTabularResource
                                                    }
                                                />
                                            </Tab.Panel>
                                            <Tab.Panel as="div">
                                                <About dataset={datasetData} />
                                            </Tab.Panel>
                                            {datasetData.methodology && (
                                                <Tab.Panel as="div">
                                                    <Methodology
                                                        methodology={
                                                            datasetData.methodology
                                                        }
                                                    />
                                                </Tab.Panel>
                                            )}
                                            <Tab.Panel as="div">
                                                <RelatedDatasets
                                                    original={datasetData.name}
                                                    datasets={
                                                        datasetData?.groups &&
                                                        datasetData.groups
                                                            .length > 0 &&
                                                        relatedDatasets.data
                                                            ? relatedDatasets.data.datasets.filter(
                                                                  (dataset) =>
                                                                      dataset.name !==
                                                                      datasetData.name
                                                              )
                                                            : []
                                                    }
                                                />
                                            </Tab.Panel>
                                            <Tab.Panel as="div">
                                                <Contact
                                                    dataset={datasetData}
                                                />
                                            </Tab.Panel>
                                            <Tab.Panel as="div">
                                                <API />
                                            </Tab.Panel>
                                            {collaborators.data && (
                                                <Tab.Panel as="div">
                                                    <Members
                                                        members={
                                                            collaborators.data
                                                        }
                                                    />
                                                </Tab.Panel>
                                            )}
                                            {issues.data &&
                                                issues.data.length > 0 && (
                                                    <Tab.Panel as="div">
                                                        <Issues
                                                            issues={issues.data}
                                                            index={indexIssues}
                                                        />
                                                    </Tab.Panel>
                                                )}
                                        </Tab.Panels>
                                    </div>
                                </Tab.Group>
                            </div>
                        </>
                    )
                }
                rhs={
                    <LazyViz
                        dataset={datasetData}
                        tabularResource={tabularResource}
                    />
                }
            />
        </>
    )
}
