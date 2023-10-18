import React from 'react'
import Image from 'next/image'
import { ChevronLeftIcon } from "@heroicons/react/20/solid";

export default function TeamHeaderCard() {
  return (
    <section id="team-header-card" className=" w-full flex flex-col lg:flex-row max-w-9xl mx-auto  font-acumin ">
      <div className='relative w-full sm:px-6 xxl:px-0 lg:w-[40%] xxl:w-[540px] h-[296px]'>
        <div className='bg-white px-4 py-4 absolute top-[76%] '>
          <div className='text-center px-3 py-3 bg-wri-gold rounded-sm font-bold text-base flex justify-center items-center gap-x-1'><ChevronLeftIcon className='w-5 h-5' /> <span>See all items</span></div>
        </div>
        <div className='w-full h-full border-b-2 border-b-wri-green  shadow flex justify-center items-center'>
          <div className=' relative  w-[393px] h-[128px] '>
            <Image src="/images/penguine.png" alt="Team card" fill />
          </div>
        </div>
      </div>
      <div className='w-full lg:w-fit flex flex-col justify-center gap-y-4 pl-5 outline'>
        <div className=' flex outline-wri-gold outline-1 outline font-bold text-[14px] text-black rounded-sm  text-center justify-center items-center gap-x-1 w-[5.563rem] h-[2.188rem]'>
          <span className='text-center text-[14px]'>Follow</span>
          <div className='w-fit'>
            <Image src='/icons/bell.svg' alt="" width={11.09} height={11.25} />
          </div>
        </div>
        <div className='flex flex-col line-clamp-3 w-[579.33px] h-[141.46px]'>
          <h2 className='font-bold text-[2.063rem]'>Team 1</h2>
        </div>
      </div>
    </section>
  )
}
