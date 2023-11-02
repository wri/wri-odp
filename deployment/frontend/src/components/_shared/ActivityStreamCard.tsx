import React from 'react'
import Image from 'next/image'

export interface activity {
  description: string,
  time: string,
  icon: string
}

export default function ActivityStreamCard({ activity }: { activity: activity }) {
  return (
    <div className='w-full flex gap-x-3'>
      <div className='bg-white p-2 flex justify-center items-center rounded-full w-fit h-fit mt-2 shadow'>
        <div className='relative w-[20px] h-[18px]  sm:w-[16px] sm:y-[16px] '>
          <Image src={`/icons/${activity.icon}.svg`} alt="update" fill />
        </div>
      </div>

      <div className='flex flex-col'>
        <p className=' line-clamp-1 font-normal text-base'>someone updated the dataset XYZ Lorem ipsum this will probably be longer</p>
        <span className='font-normal text-xs text-wri-dark-gray'>1 hour ago</span>
      </div>
    </div>
  )
}
