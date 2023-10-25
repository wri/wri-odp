import React from 'react'
import Image from 'next/image'

export interface activity {
  description: string,
  time: string,
  icon: string
}

export default function ActivityStreamCard({ activity }: { activity: activity }) {
  return (
    <div className='w-full flex gap-x-4'>
      <div className='relative w-[20px] h-[18px] mt-2 sm:w-[16px] sm:y-[16px] '>
        <Image src={`/icons/${activity.icon}.svg`} alt="update" fill />
      </div>
      <div className='flex flex-col'>
        <p className=' line-clamp-1 font-normal text-base'>someone updated the dataset XYZ Lorem ipsum this will probably be longer</p>
        <span className='font-normal text-xs text-wri-dark-gray'>1 hour ago</span>
      </div>
    </div>
  )
}
