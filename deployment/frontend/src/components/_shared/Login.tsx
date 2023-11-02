import React from 'react'
import { ExclamationCircleIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'

export default function Login() {
  return (
    <section id="login-modal" className=' font-acumin mb-4'>
      <div className="mt-2 flex flex-col">
        <div className=' text-center'>
          <ExclamationCircleIcon className='w-5 h-5 mx-auto mb-2' />
          <p className=' font-light font-wri-black text-[0.813rem]'>Registration Not Available Yet! <b>Login for WRI Members Only.</b> You Can Still Use All Portal Features.</p>
          <h3 className='mt-8 font-semibold text-[1.75rem]'>Log In</h3>
        </div>
        <div className='mt-4'>
          <form action="" className='flex flex-col gap-y-4'>

            <div className=' rounded-md px-4 group hover:bg-[#F0FDF4] hover:border-0 hover:border-b-2 hover:border-b-[#3654A5] py-3 gap-x-2 flex pr-8 flex-row items-center min-w-fit  w-full bg-white border-[1px] border-wri-gray-200'>
              <div className='grow shrink basis-auto'><input type="text" placeholder='Email' className=' focus:outline-none group-hover:bg-[#F0FDF4]  placeholder:text-xs placeholder:font-light placeholder:text-[#353535] text-xs font-light w-full' /></div>
              <div className=' my-auto'><EnvelopeIcon className='w-4 h-4 text-[#3654A5]' /></div>
            </div>

            <div className=' rounded-md px-4 group hover:bg-[#F0FDF4] hover:border-0 hover:border-b-2 hover:border-b-[#3654A5] py-3 gap-x-2 flex pr-8 flex-row items-center min-w-fit  w-full bg-white border-[1px] border-wri-gray-200'>
              <div className='grow shrink basis-auto'><input type="text" placeholder='Password' className=' focus:outline-none placeholder:text-xs placeholder:font-light placeholder:text-[#353535] text-xs font-light w-full group-hover:bg-[#F0FDF4]' /></div>
              <div className=' my-auto'><LockClosedIcon className='w-4 h-4 text-[#3654A5]' /></div>
            </div>
            <div className='font-light text-[0.875rem] text-wri-black text-right -mt-2'>
              Forgot password?
            </div>
            <button type='submit' className='bg-wri-gold text-wri-black font-semibold text-[1.125rem] rounded-sm px-4 py-4'>Log In</button>
          </form>
        </div>
        <div className='mt-8 text-center flex justify-center items-center gap-x-2'>
          <div className='font-light text-[0.875rem] border border-1 border-wri-gray w-20 h-0' />
          <div className='text-wri-black '>or</div>
          <div className='font-light text-[0.875rem] border border-1 border-wri-gray w-20 h-0' />
        </div>
        <div className='flex  mt-8 outline outline-1 outline-wri-gold rounded-sm justify-center py-4 '>
          <div className='w-4 h-4 relative my-auto'>
            <Image src='/images/wri_logo.png' alt="comment" fill />
          </div>
          <div className='ml-2 w-fit font-semibold text-base text-wri-black '>
            Sign In with your WRI Credentials
          </div>
        </div>
      </div>
    </section>
  )
}
