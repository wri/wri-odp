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
import {
    getAllDatasetFq,
    getOneDataset,
    getOnePendingDataset,
    getRecipient,
} from '@/utils/apiUtils'
import { Tab } from '@headlessui/react'
import { Index } from 'flexsearch'
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import { useSession } from 'next-auth/react'
import { NextSeo } from 'next-seo'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'

import SyncUrl from '@/components/_shared/map/SyncUrl'
import { TabularResource } from '@/components/datasets/visualizations/Visualizations'
import { useIsAddingLayers, useToggleLayergroups } from '@/utils/storeHooks'
import { decodeMapParam } from '@/utils/urlEncoding'
import { WriDataset } from '@/schema/ckan.schema'

import { User } from '@portaljs/ckan'
import { record, string } from 'zod'
import { matchesAnyPattern } from '@/utils/general'

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
        let prevdataset = await getOneDataset(datasetName, session)

        const pendingDataset = await getOnePendingDataset(
            prevdataset.id,
            session
        )

        let dataset = prevdataset

        const isSysAdmin = session?.user.sysadmin
        let userAuthorize = false
        let approvalAuth = false
        if (prevdataset.owner_org) {
            const orgdetails = await getRecipient({
                owner_org: prevdataset.owner_org,
                session: session!,
            })
            userAuthorize = !!orgdetails?.find((x) => x.id === session?.user.id)
            approvalAuth = !!orgdetails
                .filter((x) => x.capacity === 'admin')
                .find((x) => x.id === session?.user.id)
        } else if (prevdataset.creator_user_id === session?.user.id) {
            userAuthorize = true
        }

        approvalAuth = isSysAdmin || approvalAuth ? true : false
        const generalAuthorized = isSysAdmin ? isSysAdmin : userAuthorize

        const pendingExist =
            pendingDataset &&
            generalAuthorized &&
            Object.keys(pendingDataset).length > 0
                ? true
                : false

        if (pendingExist && pendingDataset && generalAuthorized) {
            dataset = pendingDataset
        }

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
                          }+approval_status:approved+draft:false
                  `
                        : '',
            })

            relatedDatasets = groupDatasets.datasets.filter(
                (d) => d.id != dataset.id
            )
        }

        let prevRelatedDatasets: WriDataset[] = []
        if (pendingExist) {
            if (prevdataset.groups?.length) {
                let groupDatasets = await getAllDatasetFq({
                    apiKey: session?.user.apikey ?? '',
                    query: { search: '', page: { start: 0, rows: 50 } },
                    fq:
                        prevdataset?.groups && prevdataset.groups.length > 0
                            ? `groups:
                              ${
                                  prevdataset?.groups
                                      ?.map((group) => group.name)
                                      .join(' OR ') ?? ''
                              }+approval_status:approved+draft:false
                      `
                            : '',
                })

                prevRelatedDatasets = groupDatasets.datasets.filter(
                    (d) => d.id != prevdataset.id
                )
            }
        }

        if (!dataset?.resources) {
            dataset.resources = []
        }

        return {
            props: {
                dataset: JSON.stringify({
                    ...dataset,
                    spatial: dataset.spatial ?? null,
                }),
                prevdataset: pendingExist
                    ? JSON.stringify({
                          ...prevdataset,
                          spatial: prevdataset.spatial ?? null,
                      })
                    : null,
                pendingExist: pendingExist,
                is_approved: pendingExist
                    ? prevdataset.is_approved ?? null
                    : dataset.is_approved ?? null,
                generalAuthorized: generalAuthorized,
                approvalAuth: approvalAuth,
                datasetName,
                datasetId: dataset.id,
                initialZustandState: {
                    dataset: JSON.stringify(dataset),
                    relatedDatasets,
                    prevRelatedDatasets,
                    mapView: mapState,
                },
            },
        }
    } catch (e) {
        console.log('DATASET PAGE ERROR')
        console.log(e)
        console.log((e as any)?.message)
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
    let { dataset, prevdataset } = props
    if (typeof dataset == 'string') dataset = JSON.parse(dataset)
    if (typeof prevdataset == 'string') prevdataset = JSON.parse(prevdataset)

    const [isCurrentVersion, setIsCurrentVersion] = useState<boolean>(false)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const datasetName = props.datasetName as string
    const datasetId = props.datasetId!
    const pendingExist = props.pendingExist!
    const datasetAuth = props.generalAuthorized!
    const is_approved = props.is_approved!
    const approvalAuth = props.approvalAuth!
    const router = useRouter()
    const { query } = router
    const isApprovalRequest =
        query?.approval === 'true' || (approvalAuth && pendingExist)
    const { isAddingLayers, setIsAddingLayers } = useIsAddingLayers()
    const session = useSession()

    const {
        data: datasetData,
        error: datasetError,
        isLoading,
    } = api.dataset.getOneActualOrPendingDataset.useQuery(
        { id: datasetId, isPending: pendingExist },
        // @ts-ignore
        { retry: 0, initialData: dataset }
    )

    const {
        data: prevDatasetData,
        error: prevDatasetError,
        isLoading: isLoadingPrev,
    } = api.dataset.getOneDataset.useQuery(
        { id: datasetName },
        // @ts-ignore
        { retry: 0, initialData: prevdataset, enabled: !!pendingExist }
    )

    const {
        data: diffData,
        isLoading: isLoadingDiff,
        fetchStatus,
    } = api.dataset.showPendingDiff.useQuery(
        {
            id: datasetId,
        },
        {
            enabled: !!pendingExist,
            retry: 0,
        }
    )
    if (!datasetData && datasetError) {
        // router.replace('/datasets/404')
    }

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

    useEffect(() => {
        if (query.tab === 'issues' && issues.data) {
            setSelectedIndex(6)
        }
    }, [issues.data, query.tab])

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

    let diffFields: string[] | never[] = []

    if (pendingExist && diffData) {
        diffFields = Object.keys(diffData).filter((item) =>
            matchesAnyPattern(item)
        )
    }

    console.log('DIFFFIELDS: ', diffFields)

    let resourceDiffValues: Array<
        Record<string, { old_value: string; new_value: string }>
    > = []
    if (pendingExist && diffData) {
        let resourceDiff: Record<
            string,
            Record<string, { old_value: string; new_value: string }>
        > = {}

        for (const current in diffData) {
            if (current.includes('resource')) {
                const resource = current.split('.')[0]!
                const field = current.split('.')[1]!

                if (!resourceDiff[resource]) {
                    resourceDiff[resource] = {}
                }

                resourceDiff = {
                    ...resourceDiff,
                    [resource]: {
                        ...resourceDiff[resource],
                        [field]: diffData[current]!,
                    },
                }
            }
        }

        resourceDiffValues = Object.values(resourceDiff)
    }

    const shouldLoad = pendingExist ? isLoadingDiff : false

    if (isLoading || !datasetData || isLoadingPrev || shouldLoad) {
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
                    datasetId={datasetData.id}
                    diffField={diffFields}
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
                                //@ts-ignore
                                dataset={
                                    isCurrentVersion
                                        ? prevDatasetData
                                        : datasetData
                                }
                                tabularResource={tabularResource}
                                setTabularResource={setTabularResource}
                                isCurrentVersion={isCurrentVersion}
                                diffFields={diffFields}
                                setIsCurrentVersion={setIsCurrentVersion}
                                datasetAuth={datasetAuth}
                                is_approved={is_approved}
                            />
                            <div className="px-4 sm:px-6">
                                <Tab.Group
                                    as="div"
                                    selectedIndex={selectedIndex}
                                    onChange={setSelectedIndex}
                                >
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
                                                    //@ts-ignore
                                                    dataset={
                                                        isCurrentVersion
                                                            ? prevDatasetData
                                                            : datasetData
                                                    }
                                                    index={index}
                                                    tabularResource={
                                                        tabularResource
                                                    }
                                                    setTabularResource={
                                                        setTabularResource
                                                    }
                                                    isCurrentVersion={
                                                        isCurrentVersion
                                                    }
                                                    diffFields={
                                                        resourceDiffValues
                                                    }
                                                />
                                            </Tab.Panel>
                                            <Tab.Panel as="div">
                                                <About
                                                    //@ts-ignore
                                                    dataset={
                                                        isCurrentVersion
                                                            ? prevDatasetData
                                                            : datasetData
                                                    }
                                                    isCurrentVersion={
                                                        isCurrentVersion
                                                    }
                                                    diffFields={diffFields}
                                                />
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
                                                    //@ts-ignore
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
