import React from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

export default function Pagination() {
  return (
    <div className='flex font-acumin gap-x-2 outline items-center'>
      <div className=' text-gray-300 font-light text-sm'>1-50 of 29,097</div>
      <div>
        <ChevronLeftIcon className='w-5 h-5 text-wri-gray' />
      </div>
      <div>
        <ChevronRightIcon className='w-5 h-5 text-wri-black' />
      </div>
    </div>
  )
}
