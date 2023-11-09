import React from 'react'
import { CheckIcon } from '@heroicons/react/24/outline'


export default function AddDatasetSuccessModal() {
  return (
    <section id="success-modal" className=' font-acumin mb-4 py-12 sm:px-10'>
      <div className="mt-2 flex flex-col">
        <div className=' text-center'>
          <div className=' w-10 h-10 mx-auto flex justify-center items-center rounded-full bg-[#58B161]'>
            <CheckIcon className='w-6 h-6 text-white ' />
          </div>
          <p className=' font-light font-wri-black text-[1.563rem] mt-6'>Your Dataset <b className=' font-bold'>Weather & Enviroment Data 2023</b> has been successfully submitted for approval!</p>
          <p className=' mt-2 font-normal text-base text-[#666666] sm:px-[4rem]'>
            Note that it could take up to 5-6 days for the dataset to get reviewed by XYZ. Meanwhile, the dataset will still be available for members of XYZ organization as a private dataset.
          </p>
        </div>
        <div className='sm:px-6 mt-8'>
          <a href="#" className='bg-wri-gold  flex justify-center items-center w-full h-20 sm:w-[451px] sm:h-[114px] mx-auto font-semibold text-[1.25rem]'>
            Go to dashboard
          </a>
          <a href="#" className='outline outline-1 outline-wri-gold mt-4  flex justify-center items-center w-full h-20  sm:w-[451px] sm:h-[114px] mx-auto font-semibold text-[1.25rem]'>
            Add another dataset
          </a>

        </div>
      </div>
    </section>
  )
}
