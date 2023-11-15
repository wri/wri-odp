import React from 'react'
import ActivityStreamCard from './ActivityStreamCard'
import Pagination from '@/components/_shared/Pagination'
import type { activity as IActivity } from './ActivityStreamCard'

export const activity: IActivity[] = [
  {
    description: "someone updated the dataset XYZ Lorem ipsum this will probably be longer",
    time: "1 hour ago",
    icon: "update",
    actionType: "changed_package"

  },
  {
    description: "someone edited the dataset XYZ Lorem ipsum this will probably be longer",
    time: "1 hour ago",
    icon: "edit",
    actionType: "changed_package"
  },
  {
    description: "someone added the dataset XYZ Lorem ipsum this will probably be longer",
    time: "1 hour ago",
    icon: "add",
    actionType: "new_package"
  },
  {
    description: "someone updated the dataset XYZ Lorem ipsum this will probably be longer",
    time: "1 hour ago",
    icon: "update",
    actionType: "changed_package"
  },
  {
    description: "someone edited the dataset XYZ Lorem ipsum this will probably be longer",
    time: "1 hour ago",
    icon: "edit",
    actionType: "changed_package"
  },
  {
    description: "someone added the dataset XYZ Lorem ipsum this will probably be longer",
    time: "1 hour ago",
    icon: "add",
    actionType: "new_package"
  },
  {
    description: "someone deleted the dataset XYZ Lorem ipsum this will probably be longer",
    time: "1 hour ago",
    icon: "update",
    actionType: "deleted_package"
  },
  {
    description: "someone deleted the dataset XYZ Lorem ipsum this will probably be longer",
    time: "1 hour ago",
    icon: "edit",
    actionType: "deleted_package"
  },
  {
    description: "someone added the dataset XYZ Lorem ipsum this will probably be longer",
    time: "1 hour ago",
    icon: "add",
    actionType: "new_package"
  },

]
export default function ActivityStreamList() {
  return (
    <section className='w-full px-4 xxl:px-0 max-w-[1317px] xxl:mx-auto flex flex-col gap-y-6 mt-10 overflow-hidden' id='activitystream'>
      {
        activity.map((activity, index) => (
          <ActivityStreamCard key={index} activity={activity} />
        ))
      }
      <Pagination />
    </section>
  )
}
