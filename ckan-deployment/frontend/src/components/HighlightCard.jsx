import React from 'react'
import Image from 'next/image'

export default function HighlightCard() {
  return (
    <div className='flex flex-col outline w-full sm:w-1/2 md:w-1/3 2xl:w-1/5  font-acumin'>
      <div className='relative w-full h-56'>
        <Image src='/images/map.png' alt="higlight" fill />
      </div>
      <div className='bg-white text-wri-green font-bold text-[0.938rem] w-[70%] py-4 -mt-6 z-10'>
        FORESTS
      </div>
      <h2 className='text-wri-black text-2xl font-bold w-[80%]'>Title of the dataset goes here lorem ipsum.</h2>
      <article className=' line-clamp-3 w-[88%] font-light text-base mt-4 leading-[1.375rem]'>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Inventore maxime ut aspernatur laborum quod architecto, repellat commodi, iure suscipit, perspiciatis vitae dolor eveniet saepe aliquid? Quae labore incidunt odit reprehenderit?</article>
      <div className='flex font-light text-sm text-wri-black mt-4 leading-[1.375rem]'>
        <div className='flex items-center'>
          <Image src='/icons/time.svg' alt="eye" width={15} height={15} />
          <span className='ml-2'>2020 - 2023</span>
        </div>
        <div className='border-l border-wri-black h-4  mx-2'></div>
        <div className='flex items-center'>
          <Image src='/icons/Framelocation.svg' alt="comment" width={15} height={15} />
          <span className='ml-2'>Sub-regional</span>
        </div>
      </div>
      <div className='flex font-light text-sm text-wri-black mt-4 leading-[1.375rem] gap-x-2'>
        <div className=' bg-gray-300 w-fit rounded-full p-1'>
          <Image src='/icons/Framechart.svg' alt="chart" width={20} height={20} />
        </div>
        <div className='  w-fit '>
          <Image src='/icons/globe.svg' alt="chart" width={30} height={30} />
        </div>
        <div className=' bg-gray-300 w-fit rounded-full p-1'>
          <Image src='/icons/table.svg' alt="chart" width={20} height={20} />
        </div>
      </div>
    </div>
  )
}
