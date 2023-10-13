import React from 'react'
import { EnvelopeIcon } from "@heroicons/react/20/solid";

export default function Footer() {
  return (
    <section id="footer" className='w-full  flex font-acumin flex-col'>
      <div className='w-full flex flex-col bg-wri-green pl-6 px-4 sm:px-9 py-10'>
        <p className='text-white mb-4 font-bold text-[1.5rem]'>Didn&apos;t find what you were looking for? </p>
        <div className='flex flex-col sm:flex-row gap-y-4 sm:gap-x-4 font-bold'>
          <div className=' bg-wri-gold text-wri-black text-center px-4 py-4 rounded-sm text-base'> Explore Topics</div>
          <div className=' bg-white text-wri-black text-center px-8 py-4 rounded-sm text-base'> Advance Search</div>
        </div>
      </div>
      <div>
        <div className='w-full pl-4 pr-2 sm:pl-12 pt-12 flex flex-col sm:flex-row gap-y-4 sm:gap-x-4 font-bold text-wri-black'>
          <div className='w-full sm:w-1/5 flex flex-col gap-y-4'>
            <p className='text-base font-bold'>ABOUT WRI</p>
            <p className=' font-normal'>About us</p>
            <p className=' font-normal'>Our Work</p>
            <p className=' font-normal'>Our Approach</p>
          </div>
          <div className='w-full sm:w-1/5 flex flex-col gap-y-4'>
            <p className='text-base font-bold'>USEFUL LINKS</p>
            <p className=' font-normal'>About us</p>
            <p className=' font-normal'>Our Work</p>
            <p className=' font-normal'>Our Approach</p>
          </div>
          <div className='w-full sm:w-1/5 flex flex-col gap-y-4'>
            <p className='text-base font-bold'>GET STARTED</p>
            <p className=' font-normal'>About us</p>
            <p className=' font-normal'>Our Work</p>
            <p className=' font-normal'>Our Approach</p>
          </div>
          <div className='w-full sm:w-1/2 flex flex-col gap-y-4'>
            <p className='font-bold text-[1.375rem]'>STAY UP TO DATE WITH THE NEWS </p>
            <div className='flex flex-col sm:flex-row gap-x-4'>
              <div className='outline outline-1 rounded-sm pl-1 py-2 gap-x-2 flex flex-row items-center flex-nowrap w-full sm:w-5/12'>
                <div className=' my-auto'><EnvelopeIcon className='w-5 h-5 text-wri-gray' /></div>
                <div ><input type="text" placeholder='Enter your email address' className=' focus:outline-none placeholder:text-xs' /></div>
              </div>
              <div className='px-4 py-2 bg-wri-gold text-wri-black font-bold  text-[0.875rem] rounded-sm'>
                SUBSCRIBE
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
