import React from 'react'
import { MagnifyingGlassIcon, ChatBubbleLeftIcon, ClockIcon } from "@heroicons/react/24/outline";

export default function Issues() {
  return (
    <section id="issues">
      <div className="relative pb-5">
        <input
          className="block w-full rounded-md border-b border-wri-green py-3 pl-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-black focus:ring-2 focus:ring-inset focus:ring-wri-green sm:text-sm sm:leading-6"
          placeholder="Find an issue"
        />
        <MagnifyingGlassIcon className="w-5 h-5 text-black absolute top-[15px] right-4" />
      </div>
      <div className='flex flex-col gap-x-3'>
        <span className='mb-1'>1 issue</span>
        {
          [1].map((_, index) => (
            <IssueCard key={index} />
          ))
        }
      </div>
    </section>
  )
}


function IssueCard() {
  return (
    <div className='flex flex-col relative font-acumin gap-y-1 border-b-2 border-wri-green bg-white p-5 shadow-wri transition hover:bg-slate-100'>
      <h3 className='font-semibold text-[1.125rem]'>Title of the Issue</h3>
      <div className='flex absolute right-8 sm:top-[40%] gap-x-1 items-center'>
        <ChatBubbleLeftIcon className='w-5 h-5 text-blue-800' />
        <div className=' font-normal text-base'>3</div>
      </div>
      <p className='font-light text-base w-full sm:w-[80%] text-[#1A1919]'>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam porta sem malesuada magna mollis euismod. Aenean lacinia bibendum nulla sed consectetur. Nullam quis risus eget urna mollis ornare vel eu leo.
      </p>
      <div className='flex items-center gap-x-1 '>
        <ClockIcon className='w-4 h-4 text-blue-800' />
        <div className=' font-light text-[0.875rem] mt-2'>2 Feb 2023</div>
      </div>


    </div>
  )
}
