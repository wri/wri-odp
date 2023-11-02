import React from 'react'
import Image from 'next/image'

export default function UserProfile() {
  return (
    <div className='w-full flex flex-col justify-center items-center font-acumin gap-y-2 text-white pb-6 pt-10'>
      <div className='relative w-24 h-24 rounded-full overflow-hidden'>
        <Image src='/images/placeholders/user/dummypro.png' fill alt='' />
      </div>
      <div className='text-[1.438rem] leading-[1.725rem] font-semibold '>John Doe</div>
      <div className='font-normal text-base '>System Admin</div>
      <div className=' text-base  font-light'>
        <span className=' mr-2'>2 Teams</span>
        <span className='w-0 h-4 border'></span>
        <span className='ml-2'>0 Datasets</span>
      </div>
    </div>
  )
}
