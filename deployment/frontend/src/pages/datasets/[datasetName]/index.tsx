import { Breadcrumbs } from '@/components/_shared/Breadcrumbs'
import Header from '@/components/_shared/Header'
import Spinner from '@/components/_shared/Spinner'
import ApprovalRequestCard from '@/components/datasets/ApprovalRequestCard'
import { DatasetHeader } from '@/components/datasets/DatasetHeader'
import DatasetPageLayout from '@/components/datasets/DatasetPageLayout'
import { DatasetTabs } from '@/components/datasets/DatasetTabs'
import AddLayers from '@/components/datasets/add-layers/AddLayers'
import { API } from '@/components/datasets/sections/API'
import { About } from '@/components/datasets/sections/About'
import { Contact } from '@/components/datasets/sections/Contact'
import { DataFiles } from '@/components/datasets/sections/DataFiles'
import Issues from '@/components/datasets/sections/Issues'
import { Members } from '@/components/datasets/sections/Members'
import { Methodology } from '@/components/datasets/sections/Methodology'
import { RelatedDatasets } from '@/components/datasets/sections/RelatedDatasets'
import { getServerAuthSession } from '@/server/auth'
import { api } from '@/utils/api'
import { getAllDatasetFq, getOneDataset } from '@/utils/apiUtils'
import { Tab } from '@headlessui/react'
import { Index } from 'flexsearch'
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import { useSession } from 'next-auth/react'
import { NextSeo } from 'next-seo'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useState } from 'react'

import SyncUrl from '@/components/_shared/map/SyncUrl'
import { TabularResource } from '@/components/datasets/visualizations/Visualizations'
import { useIsAddingLayers } from '@/utils/storeHooks'
import { decodeMapParam } from '@/utils/urlEncoding'
import { WriDataset } from '@/schema/ckan.schema'
import { User } from '@portaljs/ckan'

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

        let relatedDatasets: WriDataset[] = []
        if (dataset.groups?.length) {
            let groupDatasets = await getAllDatasetFq({
                apiKey: session?.user.apikey ?? '',
                query: { search: '', page: { start: 0, rows: 50 } },
                fq:
                    dataset?.groups && dataset.groups.length > 0
                        ? `groups:
                          ${
                              dataset?.groups
                                  ?.map((group) => group.name)
                                  .join(' OR ') ?? ''
                          }
                  `
                        : '',
            })

            relatedDatasets = groupDatasets.datasets.filter(
                (d) => d.id != dataset.id
            )
        }

        return {
            props: {
                dataset: {
                    ...dataset,
                    spatial: dataset.spatial ?? null,
                },
                datasetName,
                initialZustandState: {
                    dataset,
                    relatedDatasets,
                    mapView: mapState,
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

    const collaborators = api.dataset.getDatasetCollaborators.useQuery(
        { id: datasetName },
        { enabled: !!session.data?.user.apikey, retry: false }
    )
    const issues = api.dataset.getDatasetIssues.useQuery(
        { id: datasetName },
        { enabled: !!session.data?.user.apikey, retry: false }
    )

    const teamsDetails = api.teams.getTeam.useQuery(
        { id: datasetData?.owner_org! },
        { enabled: !!datasetData, retry: false }
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

    const openIssueLength =
        issues.data &&
        issues.data.filter((issue) => issue.status === 'open').length
            ? issues.data.filter((issue) => issue.status === 'open').length
            : undefined

    let teamAuthorized: boolean | undefined = undefined
    let generalAuthorized = false

    if (
        datasetData &&
        session.data?.user.id !== datasetData.creator_user_id &&
        session.data?.user.sysadmin === false
    ) {
        teamAuthorized = !!(
            teamsDetails.data &&
            teamsDetails.data?.users?.find(
                (user) =>
                    user.id === session.data?.user.id &&
                    (user.capacity === 'admin' || user.capacity === 'editor')
            )
        )
    } else {
        generalAuthorized = true
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
            count: openIssueLength,
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
            {isApprovalRequest && (
                <ApprovalRequestCard
                    datasetName={datasetData.name}
                    owner_org={datasetData?.owner_org || null}
                    creator_id={datasetData?.creator_user_id || null}
                />
            )}
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
                                                <RelatedDatasets />
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
                                                            datasetName={
                                                                datasetData.name
                                                            }
                                                            owner_org={
                                                                datasetData?.owner_org ||
                                                                null
                                                            }
                                                            creator_id={
                                                                datasetData?.creator_user_id ||
                                                                null
                                                            }
                                                            authorized={
                                                                teamAuthorized ||
                                                                generalAuthorized
                                                            }
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
                rhs={<LazyViz tabularResource={tabularResource} />}
            />
        </>
    )
}
