import React, { useState } from 'react'
import SearchHeader from '../_shared/SearchHeader'
import SelectFilter from '../_shared/SelectFilter'
import { api } from '@/utils/api'
import type { SearchInput } from '@/schema/search.schema';
import { getKeyValues } from '@/utils/general';
import type { GroupTree } from "@/schema/ckan.schema";

type IOrg = {
  title: string | undefined;
  name: string | undefined;
  image_display_url: string | undefined;
  description: string;
}

function LeftNode({ setQuery, query }: { setQuery: React.Dispatch<React.SetStateAction<SearchInput>>, query: SearchInput }) {
  const [queryN, setQueryN] = useState<SearchInput>({ search: '', page: { start: 0, rows: 100 } })
  const { data: team, isLoading: isLoadingTeam } = api.organization.getUsersOrganizations.useQuery(queryN)
  const { data: topics, isLoading: isLoadingTopics } = api.topics.getUsersTopics.useQuery(queryN)

  if (isLoadingTeam || isLoadingTopics) return (
    <div className='flex  gap-x-3'>
      <SelectFilter
        options={[
          { id: "1", label: "All teams" },
          { id: "2", label: "Name" },
          { id: "3", label: "Title" },
        ]}
        filtername="organization" setQuery={setQuery} query={query}
      />
      <SelectFilter
        options={[
          { id: "1", label: "All topics" },
          { id: "2", label: "Name" },
          { id: "3", label: "Title" },
        ]}
        filtername="group" setQuery={setQuery} query={query}
      />
    </div>
  )

  return (
    <div className='flex  gap-x-3'>
      <SelectFilter
        options={[{ id: "None", label: "All teams" }].concat(getKeyValues(team?.organizations as IOrg[], "title", "name"))} filtername="organization" setQuery={setQuery} query={query} />
      <SelectFilter
        options={[{ id: "None", label: "All topics" }].concat(getKeyValues(topics?.topics as GroupTree[], "name", "name"))} setQuery={setQuery} query={query} filtername='group' />
    </div>
  )

}

export default function DatasetHeader({ setQuery, query, Pagination }: { setQuery: React.Dispatch<React.SetStateAction<SearchInput>>, query: SearchInput, Pagination?: React.ReactNode }) {
  return (
    <SearchHeader setQuery={setQuery} query={query} RightNode={<LeftNode setQuery={setQuery} query={query} />} leftStyle='px-2 sm:pr-2 sm:pl-12' rightStyle='px-2 sm:pr-4' Pagination={Pagination} />
  )
}
