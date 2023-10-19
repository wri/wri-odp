import React from 'react'
import ActivityStreamCard from './ActivityStreamCard'
import Pagination from '@/components/_shared/Pagination'
const activity = [
  {
    description: "someone updated the dataset XYZ Lorem ipsum this will probably be longer",
    time: "1 hour ago",
    icon: "update"
  },
  {
    description: "someone edited the dataset XYZ Lorem ipsum this will probably be longer",
    time: "1 hour ago",
    icon: "edit"
  },
  {
    description: "someone added the dataset XYZ Lorem ipsum this will probably be longer",
    time: "1 hour ago",
    icon: "add"
  },
  {
    description: "someone updated the dataset XYZ Lorem ipsum this will probably be longer",
    time: "1 hour ago",
    icon: "update"
  },
  {
    description: "someone edited the dataset XYZ Lorem ipsum this will probably be longer",
    time: "1 hour ago",
    icon: "edit"
  },
  {
    description: "someone added the dataset XYZ Lorem ipsum this will probably be longer",
    time: "1 hour ago",
    icon: "add"
  },
  {
    description: "someone updated the dataset XYZ Lorem ipsum this will probably be longer",
    time: "1 hour ago",
    icon: "update"
  },
  {
    description: "someone edited the dataset XYZ Lorem ipsum this will probably be longer",
    time: "1 hour ago",
    icon: "edit"
  },
  {
    description: "someone added the dataset XYZ Lorem ipsum this will probably be longer",
    time: "1 hour ago",
    icon: "add"
  },

]
export default function ActivityStreamList() {
  return (
    <section className='w-full px-8 xxl:px-0 max-w-[1317px] xxl:mx-auto flex flex-col gap-y-6 mt-10' id='activitystream'>
      {
        activity.map((activity, index) => (
          <ActivityStreamCard key={index} activity={activity} />
        ))
      }
      <Pagination />
    </section>
  )
}
