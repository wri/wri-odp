import React from 'react'
import { ArrowDownOnSquareIcon, BuildingLibraryIcon, UsersIcon, SquaresPlusIcon, Squares2X2Icon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import {useSession} from 'next-auth/react'

export default  function QuickAction({ drag }: { drag: boolean }) {
  const session = useSession()
  const loginUser = session.data?.user?.name

  return (
    <div className={` flex flex-col w-full gap-y-4 shadow-wri p-6  h-full overflow-y-auto ${drag ? "border-dashed border border-wri-black bg-slate-100" : ""}`}>
      {
        drag ? (
          <div className='absolute top-0 -left-5'>
            <Squares2X2Icon className='w-4 h-4 text-wri-black' />
          </div>
        ) : ""
      }

      <p className='font-normal text-[20px] pb-2 mb-2 border-b-[0.3px] border-b-gray-100'>Quick Actions</p>
      <div className='flex flex-col sm:flex-row gap-x-4 gap-y-4 w-full  '>
        <Link href="/dashboard/datasets/new" className={`hover:font-semibold font-normal rounded-md flex flex-col justify-center items-center w-full sm:w-1/2 py-12 hover:bg-wri-gold border-b-wri-gold border-b-2 ${drag ? "bg-white" : "bg-slate-100"} `}>
          <ArrowDownOnSquareIcon className='w-8 h-8 text-black' />
          <div className='text-base'>Add a dataset</div>
        </Link>
        <Link href="/dashboard/teams/new" className={`hover:font-semibold font-normal rounded-md flex flex-col justify-center items-center w-full sm:w-1/2 py-12 hover:bg-wri-gold border-b-wri-gold border-b-2 ${drag ? "bg-white" : "bg-slate-100"} `}>
          <BuildingLibraryIcon className='w-8 h-8 text-black' />
          <div className='text-base'>Add a team</div>
        </Link>
      </div>
      <div className='flex flex-col sm:flex-row gap-x-4 gap-y-4'>
        <Link href="/dashboard/topics/new" className={`hover:font-semibold font-normal rounded-md flex flex-col justify-center items-center w-full sm:w-1/2 py-12 hover:bg-wri-gold border-b-wri-gold border-b-2 ${drag ? "bg-white" : "bg-slate-100"} `}>
          <SquaresPlusIcon className='w-8 h-8 text-black' />
          <div className='text-base'>Add a topic</div>
        </Link>
        <Link href={`/dashboard/users/edit/${loginUser}`} className={`hover:font-semibold font-normal rounded-md flex flex-col justify-center items-center w-full sm:w-1/2 py-12 hover:bg-wri-gold border-b-wri-gold border-b-2 ${drag ? "bg-white" : "bg-slate-100"} `}>
          <UsersIcon className='w-8 h-8 text-black' />
          <div className=' text-base '>Edit account</div>
        </Link>
      </div>
    </div>
  )
}
