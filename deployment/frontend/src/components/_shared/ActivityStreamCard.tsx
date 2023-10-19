import React from 'react'
import Image from 'next/image'

interface activity {
  description: string,
  time: string,
  icon: string
}

export default function ActivityStreamCard({ activity }: { activity: activity }) {
  return (
    <div className='w-full flex gap-x-4'>
      <div className=' my-auto'>
        <Image src={`/icons/${activity.icon}.svg`} alt="update" width={16} height={16} />
      </div>
      <div className='flex flex-col'>
        <p className=' line-clamp-1 font-normal text-base'>someone updated the dataset XYZ Lorem ipsum this will probably be longer</p>
        <span className='font-normal text-xs text-wri-dark-gray'>1 hour ago</span>
      </div>
    </div>
  )
}
