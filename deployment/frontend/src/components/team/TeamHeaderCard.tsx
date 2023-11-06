import React from 'react'
import Image from 'next/image'
import { ChevronLeftIcon } from "@heroicons/react/20/solid";
import { Button } from "../_shared/Button";
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function TeamHeaderCard() {
  return (
    <section id="team-header-card" className=" w-full flex flex-col md:flex-row max-w-9xl mx-auto  font-acumin gap-y-4 sm:mt-12">
      <div className='relative w-full sm:px-6 md:px-0 md:w-[40%] xxl:w-[540px] h-[296px]'>
        <div className="absolute top-[78%] flex h-[68px] w-56 items-center justify-center rounded-t-[3px] bg-white ">
            <Link href='/teams'>
          <Button>
            <ChevronLeftIcon className="mb-1 mr-1 h-6 w-6" />
            <span>See all teams</span>
          </Button>
            </Link>
        </div>
        <div className='w-full h-full border-b-2 border-b-wri-green  shadow flex justify-center items-center'>
          <div className=' relative  w-[393px] h-[128px] '>
            <Image src="/images/penguine.png" alt="Team card" fill />
          </div>
        </div>
      </div>
      <div className='w-full px-2 md:w-fit flex flex-col justify-center gap-y-3 md:pl-8'>
        <div className='flex outline-wri-gold outline-1 outline font-bold text-[14px] text-black rounded-md px-6 py-3 gap-x-1 w-fit'>

          <div className='mr-1 w-fit h-[14px]'>
            Edit
          </div>
          <PencilSquareIcon className='h-4 w-4' />
        </div>
        <div className='flex flex-col md:w-[90%] lg:w-[579.33px] gap-y-2 '>
          <h2 className='font-bold text-[2.063rem]'>Team 1</h2>
          <p className='line-clamp-3 font-light text-[1.125rem]'>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam. Ut enim ad minim veniam.</p>
          <span className='font-light text-base'>363 Datasets</span>
        </div>
      </div>
    </section>
  )
}
