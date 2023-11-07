import React from 'react'
import SearchHeader from '../_shared/SearchHeader'
import SelectFilter from '../_shared/SelectFilter'
import { WriDataset } from '@/schema/ckan.schema'
import type { SearchInput } from '@/schema/search.schema'

function LeftNode() {
  return (
    <div className='flex  gap-x-3'>
      <SelectFilter
        options={[
          { id: 1, label: "All teams" },
          { id: 2, label: "Name" },
          { id: 3, label: "Title" },
        ]} />
      <SelectFilter
        options={[
          { id: 1, label: "All topics" },
          { id: 2, label: "Name" },
          { id: 3, label: "Title" },
        ]} />
    </div>
  )

}

export default function DatasetHeader({ setQuery, query, Pagination }: { setQuery: React.Dispatch<React.SetStateAction<SearchInput>>, query: SearchInput, Pagination?: React.ReactNode }) {
  return (
    <SearchHeader setQuery={setQuery} query={query} RightNode={<LeftNode />} leftStyle='px-2 sm:pr-2 sm:pl-12' rightStyle='px-2 sm:pr-4' Pagination={Pagination} />
  )
}
