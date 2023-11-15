import React from 'react'
import Image from 'next/image'
import { DefaultTooltip } from '@/components/_shared/Tooltip';

import { TrashIcon, PencilIcon, PlusCircleIcon } from '@heroicons/react/24/outline';

export interface activity {
  description: string,
  time: string,
  icon: string
}

function Icons({ activityAction }: { activityAction: string }) {
  if (activityAction === 'changed') {
    return <PencilIcon className='w-4 h-4 text-blue-500' />
  }
  if (activityAction === 'new') {
    return <PlusCircleIcon className='w-4 h-4 text-green-500' />
  }
  if (activityAction === 'deleted') {
    return <TrashIcon className='w-4 h-4 text-red-500' />
  }
}

export default function ActivityStreamCard({ activity }: { activity: activity }) {
  const iconMap: Record<string, string> = {
    changed: "edit",
    new: "add",
    deleted: "update",
  }
  return (
    <div className='w-full flex gap-x-3'>
      <DefaultTooltip content={activity.icon}>
        <div className='bg-white p-2 flex justify-center items-center rounded-full w-fit h-fit mt-2 shadow'>
          <div className='relative w-[20px] h-[18px]  sm:w-[16px] sm:y-[16px] '>
            <Icons activityAction={activity.icon} />
          </div>
        </div>
      </DefaultTooltip>

      <div className='flex flex-col'>
        <p className=' line-clamp-1 font-normal text-base'>{activity.description}</p>
        <span className='font-normal text-xs text-wri-dark-gray'>{activity.time}</span>
      </div>
    </div>
  )
}
