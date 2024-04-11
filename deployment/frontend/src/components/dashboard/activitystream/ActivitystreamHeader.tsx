import React, { useState } from 'react'
import TableHeader from '../_shared/TableHeader'
import SelectFilter from '../_shared/SelectFilter'
import { api } from '@/utils/api'
import type { SearchInput } from '@/schema/search.schema'
import { getKeyValues2, getKeyValues } from '@/utils/general'
import type {
    ActivityDisplay,
    WriDataset,
    WriOrganization,
} from '@/schema/ckan.schema'
import { Group } from '@portaljs/ckan'
import Topic from '@/interfaces/topic.interface'

function LeftNode({
    setQuery,
    query,
    setServerQuery,
    serverQuery,
}: {
    setServerQuery: React.Dispatch<React.SetStateAction<SearchInput>>
    serverQuery: SearchInput
    setQuery: React.Dispatch<React.SetStateAction<SearchInput>>
    query: SearchInput
}) {
    const [selectEntity, setSelectEntity] = useState<SearchInput>({
        search: '',
        fq: {},
        page: { start: 0, rows: 10 },
    })
    const { data: activity, isLoading: isLoadingActivity } =
        api.dashboardActivity.listActivityStreamDashboard.useQuery({
            search: '',
            fq: {},
            page: { start: 0, rows: 1000 },
        })
    const { data: organization, isLoading: isLoadingOrganization } =
        api.organization.getAllOrganizations.useQuery()
    const { data: dataset, isLoading: isLoadingDataset } =
        api.dataset.getFavoriteDataset.useQuery()
    const { data: group, isLoading: isLoadingGroup } =
        api.topics.getAllTopics.useQuery()

    if (isLoadingActivity || isLoadingOrganization || isLoadingGroup)
        return (
            <div className="flex  gap-x-3">
                <SelectFilter
                    options={[
                        { id: '1', label: 'All activity' },
                        { id: '2', label: 'Name' },
                        { id: '3', label: 'Title' },
                    ]}
                    filtername="organization"
                    setQuery={setQuery}
                    query={query}
                />

                <SelectFilter
                    options={[
                        { id: 'None', label: 'Filter by' },
                        { id: 'dataset', label: 'dataset' },
                        { id: 'teams', label: 'teams' },
                        { id: 'topics', label: 'topics' },
                    ]}
                    filtername="selectEntity"
                    setQuery={setSelectEntity}
                    query={selectEntity}
                />

                <SelectFilter
                    options={[
                        { id: 'all', label: 'All times' },
                        { id: 'day', label: '<= 1day' },
                        { id: 'week', label: '<= 1week' },
                        { id: 'month', label: '<= 1month' },
                        { id: 'year', label: '<= 1year' },
                    ]}
                    filtername="timestamp"
                    setQuery={setQuery}
                    query={query}
                />
            </div>
        )

    return (
        <div className="flex w-full gap-x-4 pl-6 pr-2 sm:pr-0 pt-2 sm:pt-0 flex-col gap-y-2 sm:flex-row sm:gap-y-0">
            <SelectFilter
                options={[
                    { id: 'None', label: 'All activity' },
                    { id: 'new', label: 'new' },
                    { id: 'changed', label: 'changed' },
                    { id: 'deleted', label: 'deleted' },
                ]}
                filtername="action"
                setQuery={setQuery}
                query={query}
            />

            <SelectFilter
                options={[
                    { id: 'None', label: 'Filter by' },
                    { id: 'dataset', label: 'dataset' },
                    { id: 'teams', label: 'teams' },
                    { id: 'topics', label: 'topics' },
                ]}
                filtername="selectEntity"
                setQuery={setSelectEntity}
                query={selectEntity}
            />

            {selectEntity.search === 'dataset' ? (
                <SelectFilter
                    options={[{ id: 'None', label: 'All dataset' }].concat(
                        getKeyValues(
                            dataset?.datasets as WriDataset[],
                            'title',
                            'id'
                        )
                    )}
                    filtername="packageId"
                    setQuery={setServerQuery}
                    query={serverQuery}
                />
            ) : (
                ''
            )}
            {selectEntity.search === 'teams' ? (
                <SelectFilter
                    options={[{ id: 'None', label: 'All teams' }].concat(
                        getKeyValues(
                            organization as WriOrganization[],
                            'title',
                            'id'
                        )
                    )}
                    filtername="orgId"
                    setQuery={setServerQuery}
                    query={serverQuery}
                />
            ) : (
                ''
            )}

            {selectEntity.search === 'topics' ? (
                <SelectFilter
                    options={[{ id: 'None', label: 'All topics' }].concat(
                        getKeyValues(group as Group[], 'title', 'id')
                    )}
                    filtername="groupId"
                    setQuery={setServerQuery}
                    query={serverQuery}
                />
            ) : (
                ''
            )}

            <SelectFilter
                options={[
                    { id: 'all', label: 'All times' },
                    { id: 'day', label: '<= 1day' },
                    { id: 'week', label: '<= 1week' },
                    { id: 'month', label: '<= 1month' },
                    { id: 'year', label: '<= 1year' },
                ]}
                filtername="timestamp"
                setQuery={setQuery}
                query={query}
            />
        </div>
    )
}

export default function ActivitystreamHeader({
    setQuery,
    query,
    setServerQuery,
    serverQuery,
    Pagination,
}: {
    setQuery: React.Dispatch<React.SetStateAction<SearchInput>>
    query: SearchInput
    setServerQuery: React.Dispatch<React.SetStateAction<SearchInput>>
    serverQuery: SearchInput
    Pagination?: React.ReactNode
}) {
    return (
        <TableHeader
            leftNode={
                <LeftNode
                    setServerQuery={setServerQuery}
                    serverQuery={serverQuery}
                    setQuery={setQuery}
                    query={query}
                />
            }
            rightStyle="sm:mt-4"
            Pagination={Pagination}
        />
    )
}
