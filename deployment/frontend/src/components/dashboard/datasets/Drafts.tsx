import React, { useState } from 'react'
import SearchHeader from '../_shared/SearchHeader'
import { DraftRow } from './DatasetRow'
import { api } from '@/utils/api'
import Spinner from '@/components/_shared/Spinner';
import type { SearchInput } from '@/schema/search.schema';
import Pagination from '../_shared/Pagination';


export default function Drafts() {
  const [query, setQuery] = useState<SearchInput>({ search: '', page: { start: 0, rows: 2 } })
  const { data, isLoading } = api.dataset.getDraftDataset.useQuery(query)

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <Spinner className="mx-auto my-2" />
      </div>
    )
  }

  return (
    <section className='w-full max-w-8xl flex flex-col gap-y-5 sm:gap-y-0'>
      <SearchHeader leftStyle='px-2 sm:pr-2 sm:pl-12' setQuery={setQuery} query={query} Pagination={<Pagination setQuery={setQuery} query={query} isLoading={isLoading} count={data?.count} />} />
      <div className='w-full'>
        {
          data?.datasets.length === 0 ? <div className='flex justify-center items-center h-screen'>No data</div> :
            data?.datasets.map((items, index) => {
              return (
                <DraftRow key={index} dataset={items} className={index % 2 === 0 ? ' bg-wri-row-gray hover:bg-wri-slate' : ''} />
              )
            })
        }
      </div>
    </section>
  )
}
