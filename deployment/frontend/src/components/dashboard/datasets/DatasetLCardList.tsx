import React, { useState } from 'react'
import DatasetHeader from './DatasetHeader'
import DatasetRow from './DatasetRow'
import { api } from '@/utils/api'
import Spinner from '@/components/_shared/Spinner';
import type { SearchInput } from '@/schema/search.schema';
import Pagination from '../_shared/Pagination';

export default function DatasetLCardList() {
  const [query, setQuery] = useState<SearchInput>({ search: '', page: { start: 0, rows: 5 } })
  const { data, isLoading } = api.dataset.getAllDataset.useQuery(query)

  return (
    <section className='w-full max-w-sm sm:max-w-8xl flex  flex-col gap-y-20 sm:gap-y-0'>
      <DatasetHeader setQuery={setQuery} query={query} Pagination={<Pagination setQuery={setQuery} query={query} isLoading={isLoading} count={data?.count} />} />
      <div className='w-full' id="alldataset">
        {
          isLoading ? <div className='flex justify-center items-center h-screen'><Spinner className="mx-auto my-2" /></div> : (
            data?.datasets.length === 0 ? <div className='flex justify-center items-center h-screen'>No data</div> :
              data?.datasets.map((items, index) => {
                return (
                  <DatasetRow key={index} dataset={items} className={index % 2 === 0 ? ' bg-wri-row-gray hover:bg-slate-100' : ''} />
                )
              })
          )
        }
      </div>


    </section>
  )
}
