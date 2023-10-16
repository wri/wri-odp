import React from 'react'
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";

export default function Search() {
  return (
    <section id="search" className='bg-cover bg-center bg-no-repeat w-full flex flex-col font-acumin h-[30vh]' style={{
      backgroundImage: 'url(/images/bg.png)'
    }}>
      <div className='flex bg-wri-green px-4 sm:px-14 text-white font-semibold text-[1.063rem] gap-x-2'>
        <div className='p-4 bg-wri-dark-green'>Explore data</div>
        <div className='p-4 '>Advance search</div>
      </div>
      <div className=' mt-16 px-6 sm:px-0 sm:ml-20 sm:mt-8 md:mt-20 lg:mt-8 xl:mt-16 2xl:mt-24'>
        <div className='shadow rounded-sm px-4 py-4 gap-x-2 flex flex-row items-center min-w-fit  w-full sm:w-1/2 bg-white'>
          <div className='grow shrink basis-auto'><input type="text" placeholder='Search data' className=' focus:outline-none placeholder:text-xs text-xs font-normal w-full' /></div>
          <div className=' my-auto'><MagnifyingGlassIcon className='w-4 h-4 text-wri-black' /></div>
        </div>
      </div>
    </section>
  )
}
