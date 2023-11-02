import React from 'react'
import { ArrowDownOnSquareIcon, BuildingLibraryIcon, UsersIcon, SquaresPlusIcon, Squares2X2Icon } from '@heroicons/react/24/outline'

export default function QuickAction({ drag }: { drag: boolean }) {
  return (
    <div className={` flex flex-col w-full gap-y-4 shadow-wri p-6  h-full overflow-y-auto ${drag ? "border-dashed border border-wri-black bg-slate-100" : ""}`}>
      {
        drag ? (
          <div className='absolute top-0 -left-5'>
            <Squares2X2Icon className='w-4 h-4 text-wri-black' />
          </div>
        ) : ""
      }

      <p className='font-normal text-[20px] mb-4 border-b-[0.3px] border-b-gray-100'>Quick Actions</p>
      <div className='flex flex-col sm:flex-row gap-x-4 gap-y-4 w-full  '>
        <div className={`hover:font-semibold font-normal rounded-md flex flex-col justify-center items-center w-full sm:w-1/2 py-12 hover:bg-wri-gold border-b-wri-gold border-b-2 ${drag ? "bg-white" : "bg-slate-100"} `}>
          <ArrowDownOnSquareIcon className='w-8 h-8 text-black' />
          <div className='text-base'>Add a dataset</div>
        </div>
        <div className={`hover:font-semibold font-normal rounded-md flex flex-col justify-center items-center w-full sm:w-1/2 py-12 hover:bg-wri-gold border-b-wri-gold border-b-2 ${drag ? "bg-white" : "bg-slate-100"} `}>
          <BuildingLibraryIcon className='w-8 h-8 text-black' />
          <div className='text-base'>Add a team</div>
        </div>
      </div>
      <div className='flex flex-col sm:flex-row gap-x-4 gap-y-4'>
        <div className={`hover:font-semibold font-normal rounded-md flex flex-col justify-center items-center w-full sm:w-1/2 py-12 hover:bg-wri-gold border-b-wri-gold border-b-2 ${drag ? "bg-white" : "bg-slate-100"} `}>
          <SquaresPlusIcon className='w-8 h-8 text-black' />
          <div className='text-base'>Add a topic</div>
        </div>
        <div className={`hover:font-semibold font-normal rounded-md flex flex-col justify-center items-center w-full sm:w-1/2 py-12 hover:bg-wri-gold border-b-wri-gold border-b-2 ${drag ? "bg-white" : "bg-slate-100"} `}>
          <UsersIcon className='w-8 h-8 text-black' />
          <div className=' text-base '>Edit account</div>
        </div>
      </div>
    </div>
  )
}