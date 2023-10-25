import React from 'react'
import { ArrowPathIcon, ArrowRightIcon, Squares2X2Icon } from '@heroicons/react/24/outline'


function Favourite() {
  return (
    <div className='flex flex-col hover:bg-slate-100 p-1 mb-2 pb-2 rounded-md'>
      <p className='font-normal text-base'>De Finibus Bonorum et Malorum, written by Cicero in 45 BC</p>
      <div className='flex '>
        <ArrowPathIcon className='w-3 h-3  text-[#3654A5] mt-[2px]' />
        <div className='ml-1 w-fit h-[12px] text-[12px]'>
          20 Sept 2022
        </div>
      </div>
    </div>
  )
}
export default function Favourites({ drag }: { drag: boolean }) {
  return (
    <section id="favourites" className={`p-6 w-full shadow-wri h-full overflow-y-auto ${drag ? "border-dashed border border-wri-black" : ""}`}>
      {
        drag ? (
          <div className='absolute top-0 -left-5'>
            <Squares2X2Icon className='w-4 h-4 text-wri-black' />
          </div>
        ) : ""
      }
      <div className='flex px-2 mb-2'>
        <p className='font-normal text-[20px]'>My Favourites</p>
        <div className='ml-auto flex items-center font-semibold text-[14px] text-wri-green'><span>See all</span> <ArrowRightIcon className='w-4 h-4' /></div>
      </div>
      {
        [1, 2, 3, 4, 5, 6].map((items) => {
          return (
            <Favourite key={items} />
          )
        })
      }
    </section>

  )
}
