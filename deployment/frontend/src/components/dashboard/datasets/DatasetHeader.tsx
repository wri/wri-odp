import React, { useState } from 'react'
import SearchHeader from '../_shared/SearchHeader'
import SelectFilter from '../_shared/SelectFilter'
import { api } from '@/utils/api'
import type { SearchInput } from '@/schema/search.schema'
import { getKeyValues } from '@/utils/general'
import type { Group } from '@portaljs/ckan'
import type { WriOrganization } from '@/schema/ckan.schema'

type IOrg = {
    title: string | undefined
    name: string | undefined
    image_display_url: string | undefined
    description: string
}

function LeftNode({
    setQuery,
    query,
}: {
    setQuery: React.Dispatch<React.SetStateAction<SearchInput>>
    query: SearchInput
}) {
    const { data: team, isLoading: isLoadingTeam } =
        api.organization.getAllOrganizations.useQuery()
    const { data: topics, isLoading: isLoadingTopics } =
        api.topics.getAllTopics.useQuery()

    if (isLoadingTeam || isLoadingTopics)
        return (
            <div className="flex  gap-x-3">
                <SelectFilter
                    options={[
                        { id: '1', label: 'All teams' },
                        { id: '2', label: 'Name' },
                        { id: '3', label: 'Title' },
                    ]}
                    filtername="organizationtemp"
                    setQuery={() => {}}
                    query={{} as SearchInput}
                />
                <SelectFilter
                    options={[
                        { id: '1', label: 'All topics' },
                        { id: '2', label: 'Name' },
                        { id: '3', label: 'Title' },
                    ]}
                    filtername="grouptemp"
                    setQuery={() => {}}
                    query={{} as SearchInput}
                />
            </div>
        )

    return (
        <div className="flex  gap-x-3" key="selectrender">
            <SelectFilter
                key="teamselect"
                options={[{ id: 'None', label: 'All teams' }].concat(
                    getKeyValues(team as WriOrganization[], 'title', 'name')
                )}
                filtername="organization"
                setQuery={setQuery}
                query={query}
            />
            <SelectFilter
                key="topicselect"
                options={[{ id: 'None', label: 'All topics' }].concat(
                    getKeyValues(topics as Group[], 'name', 'name')
                )}
                setQuery={setQuery}
                query={query}
                filtername="groups"
            />
        </div>
    )
}

export default function DatasetHeader({
    setQuery,
    query,
    Pagination,
}: {
    setQuery: React.Dispatch<React.SetStateAction<SearchInput>>
    query: SearchInput
    Pagination?: React.ReactNode
}) {
    return (
        <SearchHeader
            setQuery={setQuery}
            query={query}
            RightNode={<LeftNode setQuery={setQuery} query={query} />}
            leftStyle="px-2 sm:pr-2 sm:pl-12"
            rightStyle="px-2 sm:pr-4"
            Pagination={Pagination}
        />
    )
}
