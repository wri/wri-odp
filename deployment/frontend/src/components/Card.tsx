import React from 'react'
import Image from 'next/image'

export default function Card() {
  return (
    <div className='flex flex-col w-full font-acumin p-4 pb-6 border-b-2 border-b-wri-green shadow'>
      <div className='bg-white text-wri-green font-bold text-[0.938rem] leading-[1.125rem] w-full pt-4 pb-2'>
        LAND AND CARBON LAB
      </div>
      <h2 className='text-wri-black text-2xl font-bold w-full'>Title of the dataset goes here lorem ipsum.</h2>
      <article className=' line-clamp-3 w-[88%] font-light text-base mt-4 leading-[1.375rem]'>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Inventore maxime ut aspernatur laborum quod architecto, repellat commodi, iure suscipit, perspiciatis vitae dolor eveniet saepe aliquid? Quae labore incidunt odit reprehenderit?</article>
      <div className='flex font-light text-sm text-wri-black mt-4 leading-[1.375rem] '>
        <div className='flex  '>
          <div className='w-4 h-4 relative'>
            <Image src='/icons/time.svg' alt="eye" fill />
          </div>
          <div className='ml-2 w-fit h-[14px]'>
            2020 - 2023
          </div>
        </div>
        <div className='border-l border-wri-black h-4  mx-2'></div>
        <div className='flex '>
          <div className='w-4 h-4 relative'>
            <Image src='/icons/Framelocation.svg' alt="comment" fill />
          </div>
          <div className='ml-1 w-fit h-[14px]'>
            Sub-regional
          </div>
        </div>
      </div>
      <div className='flex font-light text-sm text-wri-black mt-4 leading-[1.375rem] gap-x-2'>
        <div className=' bg-gray-300 w-fit rounded-full p-1'>
          <Image src='/icons/Framechart.svg' alt="chart" width={20} height={20} />
        </div>
        <div className='  w-fit bg-gray-300 rounded-full'>
          <Image src='/icons/globe.svg' alt="chart" width={30} height={30} />
        </div>
        <div className=' bg-gray-300 w-fit rounded-full p-1'>
          <Image src='/icons/table.svg' alt="chart" width={20} height={20} />
        </div>
      </div>
    </div>
  )
}
