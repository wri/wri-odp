import React from 'react'
import ActivitystreamHeader from './ActivitystreamHeader'
import { activity as activitydata } from '../../_shared/ActivityStreamList'
import ActivityStreamCard from '../../_shared/ActivityStreamCard'
import { useSession } from "next-auth/react";
import { api } from '@/utils/api';
import Spinner from '@/components/_shared/Spinner';


export default function ActivityList() {
  const { data, isLoading } = api.dashboardActivity.listActivityStreamDashboard.useQuery();

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <Spinner className="mx-auto my-2" />
      </div>
    )
  }

  return (
    <section className='max-w-8xl  w-full flex flex-col gap-y-5 sm:gap-y-0'>
      <ActivitystreamHeader />

      {
        data?.activity.map((items, index) => {
          return (
            <div className=' hover:bg-slate-100 pl-6 p-1 mb-2 pb-2 rounded-md' key={index}>
              <ActivityStreamCard activity={items} />
            </div>
          )
        })
      }
    </section>
  )
}
