import React, { useState } from 'react'
import ActivitystreamHeader from './ActivitystreamHeader'
import ActivityStreamCard from '../../_shared/ActivityStreamCard'
import { api } from '@/utils/api';
import Spinner from '@/components/_shared/Spinner';
import type { SearchInput } from '@/schema/search.schema';
import Pagination from '../_shared/Pagination';

export default function ActivityList() {
  const [query, setQuery] = useState<SearchInput>({ search: '', page: { start: 0, rows: 10 } })
  const { data, isLoading } = api.dashboardActivity.listActivityStreamDashboard.useQuery(query);

  return (
    <section className='max-w-8xl  w-full flex flex-col gap-y-5 sm:gap-y-0'>
      <ActivitystreamHeader setQuery={setQuery} query={query} Pagination={<Pagination setQuery={setQuery} query={query} isLoading={isLoading} count={data?.count} />} />

      {
        isLoading ? <div className='flex justify-center items-center h-screen'><Spinner className="mx-auto my-2" /></div> : (
          data?.activity === undefined || data?.activity.length === 0 ? <div className='flex justify-center items-center h-screen'>No data</div> :
            data?.activity.map((items, index) => {
              return (
                <div className=' hover:bg-slate-100 pl-6 p-1 mb-2 pb-2 rounded-md' key={index}>
                  <ActivityStreamCard activity={items} />
                </div>
              )
            })
        )
      }
    </section>
  )
}
