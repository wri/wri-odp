import React from 'react'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import ActivityStreamCard from '../_shared/ActivityStreamCard'
import type { activity } from '../_shared/ActivityStreamCard'
import { activity as activitydata } from '../_shared/ActivityStreamList'
import { Squares2X2Icon } from '@heroicons/react/24/outline'
import Link from 'next/link'


function ActivityStreamUser({ activity }: { activity: activity }) {
  return (
    <div className=' hover:bg-slate-100 p-2 mb-2 pb-2 rounded-md'>
      <ActivityStreamCard activity={activity} />
    </div>
  )
}
export default function UserActivityStreams({ drag }: { drag: boolean }) {
  return (
    <section id="favourites" className={`p-6 w-full shadow-wri h-full overflow-y-auto ${drag ? "border-dashed border border-wri-black " : ""}`}>
      {
        drag ? (
          <div className='absolute top-0 -left-5'>
            <Squares2X2Icon className='w-4 h-4 text-wri-black' />
          </div>
        ) : ""
      }
      <div className='flex px-2 mb-4 border-b-[0.3px] border-b-gray-100'>
        <p className='font-normal text-[20px]'>Activity Stream</p>
        <Link href="/dashboard/activity-stream" className='ml-auto flex items-center font-semibold gap-x-1 text-[14px] text-wri-green'><span>See all</span> <ArrowRightIcon className='w-4 h-4 mb-1' /></Link>
      </div>
      {
        activitydata.slice(0, 6).map((items, index) => {
          return (
            <ActivityStreamUser key={index} activity={items as activity} />
          )
        })
      }
    </section>

  )
}
