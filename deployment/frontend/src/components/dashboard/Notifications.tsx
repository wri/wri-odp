import React from 'react'
import { ArrowPathIcon, ArrowRightIcon, Squares2X2Icon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import Link from 'next/link'
import { DefaultTooltip } from '../_shared/Tooltip'


function Notification() {
  return (
    <div className='flex flex-col sm:flex-row gap-x-4 hover:bg-slate-100 p-2 px-3 py-4 mb-2 pb-2 rounded-md'>
      <div className='flex gap-x-3'>
        <DefaultTooltip content='unread'>
          <div className='w-2 h-2 rounded-full bg-wri-gold my-auto'></div>
        </DefaultTooltip>
        <div className='relative w-10 h-10'>
          <Image src='/images/placeholders/user/userdefault.png' alt='' fill />
        </div>
      </div>
      <div className='flex flex-col'>
        <p className='font-normal text-base'>Someone sent you a request for approval</p>
        <span className='text-[#666666] font-tight text-[12px] '>1 hour ago</span>
      </div>
    </div>
  )
}
export default function Notifications({ drag }: { drag: boolean }) {
  return (
    <section id="favourites" className={`p-6 pb-4 w-full shadow-wri h-full overflow-y-auto ${drag ? "border-dashed border border-wri-black " : ""}`}>
      {
        drag ? (
          <DefaultTooltip content='drag'>
            <div className='absolute top-0 -left-5'>
              <Squares2X2Icon className='w-4 h-4 text-wri-black' />
            </div>
          </DefaultTooltip>

        ) : ""
      }
      <div className='flex px-2 mb-4 border-b-[0.3px] border-b-gray-100'>
        <div className='flex gap-x-2'>
          <p className='font-normal text-[20px]'>Notifications </p>
          <DefaultTooltip content={`3 unread`}>
            <div className='rounded-full my-auto w-4 h-4 bg-wri-gold font-bold text-[11px] flex justify-center items-center'>3</div>
          </DefaultTooltip>
        </div>
        <Link href="/dashboard/notifications" className='ml-auto flex items-center font-semibold gap-x-1 text-[14px] text-wri-green'><span>See all</span> <ArrowRightIcon className='w-4 h-4 mb-1' /></Link>
      </div>
      {
        [1, 2, 3, 4, 5, 6].map((items) => {
          return (
            <Notification key={items} />
          )
        })
      }
    </section>

  )
}
