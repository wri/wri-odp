import React from 'react'
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";

export default function TopicsSearch() {
  return (
    <section id="search" className='bg-cover bg-center bg-no-repeat w-full flex flex-col justify-center font-acumin h-[245px]' style={{
      backgroundImage: 'url(/images/bg.png)'
    }}>
      <div className='w-full'>
        <div className='px-8 sm:pl-12  xxl:pl-5 max-w-8xl mx-auto'>
          <div className='shadow rounded-sm px-4 py-4 gap-x-2 flex flex-row items-center min-w-fit  w-full sm:w-1/2 bg-white'>
            <div className='grow shrink basis-auto'><input type="text" placeholder='Search data' className=' focus:outline-none placeholder:text-xs text-xs font-normal w-full' /></div>
            <div className=' my-auto'><MagnifyingGlassIcon className='w-4 h-4 text-wri-black' /></div>
          </div>
        </div>
      </div>

    </section>
  )
}
