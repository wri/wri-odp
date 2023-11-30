import React, { useState } from 'react'
import ActivitystreamHeader from './ActivitystreamHeader'
import ActivityStreamCard from '../../_shared/ActivityStreamCard'
import { api } from '@/utils/api';
import Spinner from '@/components/_shared/Spinner';
import type { SearchInput } from '@/schema/search.schema';
import Pagination from '../_shared/Pagination';
import { useQuery } from 'react-query';
import { filterObjects, searchArrayForKeyword } from "@/utils/general";

export default function ActivityList() {
  const [query, setQuery] = useState<SearchInput>({ search: '', fq: {}, page: { start: 0, rows: 10 } })
  const { data, isLoading } = api.dashboardActivity.listActivityStreamDashboard.useQuery({ search: '', page: { start: 0, rows: 10000 } });

  const processedActivity = useQuery(['processedActivitystream', data, query], () => {
    if (!data) return { activity: [], count: 0 };
    const searchTerm = query.search.toLowerCase();
    const activity = data.activity;
    let filteredActivity = activity;
    if (searchTerm) {
      filteredActivity = searchArrayForKeyword(activity, searchTerm);
    }

    const fq = query.fq!;
    if (fq && Object.keys(fq).length > 0) {
      console.log("in here")
      filteredActivity = filterObjects(filteredActivity, fq);
    }

    const start = query.page.start;
    const rows = query.page.rows;
    const slicedData = filteredActivity.slice(start, start + rows);
    return { activity: slicedData, count: filteredActivity.length };
  }, {
    enabled: !!data, // Only run the query when data is available
  });




  return (
    <section className='max-w-8xl  w-full flex flex-col gap-y-5 sm:gap-y-0'>
      <ActivitystreamHeader setQuery={setQuery} query={query} Pagination={<Pagination setQuery={setQuery} query={query} isLoading={processedActivity.isLoading} count={processedActivity.data?.count} />} />

      {
        isLoading || processedActivity.isLoading ? <div className='flex justify-center items-center h-screen'><Spinner className="mx-auto my-2" /></div> : (
          processedActivity.data?.activity === undefined || processedActivity.data?.activity.length === 0 ? <div className='flex justify-center items-center h-screen'>No data</div> :
            processedActivity.data?.activity.map((items, index) => {
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
