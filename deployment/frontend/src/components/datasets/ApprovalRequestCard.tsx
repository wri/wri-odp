import React, { useState } from 'react'
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Modal from '@/components/_shared/Modal'
import { useRouter } from 'next/router'

export default function ApprovalRequestCard() {
  const [open, setOpen] = useState(false)

  const router = useRouter()
  const { query } = router

  return (
    <>
      <div className='bg-slate-100 w-full h-40 sm:h-20  flex  flex-col sm:flex-row justify-center items-center  gap-x-2 gap-y-4'>
        <button
          className='flex justify-center items-center  bg-[#58B161] rounded-md text-white font-semibold text-base px-6 py-2'
          onClick={() => router.push({ pathname: router.pathname, query: { ...query, approval: undefined } })}
        >
          <CheckIcon className='w-5 h-5 text-white mr-2' />
          Approve request
        </button>
        <button
          className='flex justify-center items-center  bg-[#DD0000] rounded-md text-white font-semibold text-base px-6 py-2'
          onClick={() => setOpen(true)}
        >
          <XMarkIcon className='w-5 h-5 text-white mr-2' />
          Reject request
        </button>
      </div>
      <Modal open={open} setOpen={setOpen} className="w-full max-w-[22rem] sm:max-w-3xl   sm:py-14 rounded-sm ">
        <div className='flex flex-col px-4'>
          <p className='font-normal text-[1.563rem]'>Describe the reason for rejection</p>
          <p className='font-normal text-base text-[#666666]'>Lorem ipsum mipsum hipsum dolor....</p>
          <form>

            <input className='w-full h-12 bg-white rounded-sm border border-[#E5E5E5] mt-4 p-4' placeholder='Title' />
            <textarea
              className='w-full h-40 bg-white rounded-sm border border-[#E5E5E5] mt-4 p-4'
              placeholder='Description...'
            />
            <div className='flex justify-end mt-4'>
              <button
                className='bg-[#DD0000] rounded-md text-white font-semibold text-base px-6 py-2 flex justify-center items-center gap-x-1'
                onClick={() => setOpen(false)}
              >
                <XMarkIcon className='w-5 h-5 text-white mr-2' />
                Reject and send feedback
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>

  )
}
