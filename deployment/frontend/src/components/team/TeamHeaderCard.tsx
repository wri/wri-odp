import React from 'react'
import Image from 'next/image'
import { ChevronLeftIcon } from "@heroicons/react/20/solid";

export default function TeamHeaderCard() {
  return (
    <section id="team-header-card" className=" w-full flex flex-col md:flex-row max-w-9xl mx-auto  font-acumin gap-y-4">
      <div className='relative w-full sm:px-6 md:px-0 md:w-[40%] xxl:w-[540px] h-[296px]'>
        <div className='bg-white px-4 py-4 absolute top-[76%] '>
          <div className='text-center px-3 py-3 bg-wri-gold rounded-sm font-bold text-base flex justify-center items-center gap-x-1'><ChevronLeftIcon className='w-5 h-5' /> <span>See all items</span></div>
        </div>
        <div className='w-full h-full border-b-2 border-b-wri-green  shadow flex justify-center items-center'>
          <div className=' relative  w-[393px] h-[128px] '>
            <Image src="/images/penguine.png" alt="Team card" fill />
          </div>
        </div>
      </div>
      <div className='w-full px-2 md:w-fit flex flex-col justify-center gap-y-4 md:pl-8'>
        <div className=' flex outline-wri-gold outline-1 outline font-bold text-[14px] text-black rounded-md px-6 py-3 gap-x-1 w-fit'>
          <span className=' text-[0.875rem] w-fit'>Follow</span>
          <div className='relative w-4 h-4'>
            <Image src='/icons/bell.svg' alt="" fill />
          </div>
        </div>
        <div className='flex flex-col md:w-[90%] lg:w-[579.33px] gap-y-4 '>
          <h2 className='font-bold text-[2.063rem]'>Team 1</h2>
          <p className='  line-clamp-3 font-light text-[1.125rem]'>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam. Ut enim ad minim veniam.</p>
          <span className=' font-light text-base'>363 Datasets</span>
        </div>
      </div>
    </section>
  )
}
