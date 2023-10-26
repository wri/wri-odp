import React from 'react'
import ActivitystreamHeader from './ActivitystreamHeader'
import { activity as activitydata } from '../../_shared/ActivityStreamList'
import ActivityStreamCard from '../../_shared/ActivityStreamCard'


export default function ActivityList() {
  return (
    <section className='max-w-8xl  w-full'>
      <ActivitystreamHeader />

      {
        activitydata.map((items, index) => {
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
