import React from 'react'
import TableHeader from '../_shared/TableHeader'
import SelectFilter from '../_shared/SelectFilter'
import { api } from '@/utils/api'
import type { SearchInput } from '@/schema/search.schema';
import { getKeyValues2 } from '@/utils/general';
import type { ActivityDisplay } from '@/schema/ckan.schema';

function LeftNode({ setQuery, query }: { setQuery: React.Dispatch<React.SetStateAction<SearchInput>>, query: SearchInput }) {
  const { data: activity, isLoading: isLoadingActivity } = api.dashboardActivity.listActivityStreamDashboard.useQuery({ search: '', page: { start: 0, rows: 100 } })

  if (isLoadingActivity) return (
    <div className='flex  gap-x-3'>
      <SelectFilter
        options={[
          { id: "1", label: "All activity" },
          { id: "2", label: "Name" },
          { id: "3", label: "Title" },
        ]}
        filtername="organization" setQuery={setQuery} query={query}
      />

      {/* <SelectFilter
        options={[
          { id: "1", label: "All times" },
          { id: "2", label: "Name" },
          { id: "3", label: "Title" },
        ]}
        filtername="group" setQuery={setQuery} query={query}
      /> */}
    </div>
  )

  return (
    <div className='flex w-full gap-x-4 pl-6 pr-2 sm:pr-0 pt-2 sm:pt-0'>
      <SelectFilter
        options={[{ id: "None", label: "All activity" }].concat(getKeyValues2(activity?.activity as ActivityDisplay[], "action", "action"))} filtername="action" setQuery={setQuery} query={query} />

      {/* <SelectFilter
        options={[
          { id: 1, label: "All teams" },
          { id: 2, label: "Name" },
          { id: 3, label: "Title" },
        ]} />
      <SelectFilter
        options={[
          { id: 1, label: "All times" },
          { id: 2, label: "Name" },
          { id: 3, label: "Title" },
        ]} /> */}
    </div>
  )

}

export default function ActivitystreamHeader({ setQuery, query, Pagination }: { setQuery: React.Dispatch<React.SetStateAction<SearchInput>>, query: SearchInput, Pagination?: React.ReactNode }) {
  return (
    <TableHeader leftNode={<LeftNode setQuery={setQuery} query={query} />} rightStyle='sm:mt-4' Pagination={Pagination} />
  )
}
