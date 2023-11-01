import React from 'react'
import TableHeader from '../_shared/TableHeader'


function LeftNode() {
  return (
    <div className=' sm:flex flex-col sm:flex-row hidden  gap-y-3 font-normal text-base w-full lg:max-w-[90%] xl:max-w-[80%] pl-4 sm:pl-10'>
      <div className='flex items-center w-[36%] lg:w-[40%] xl:w-1/2 gap-x-5'>
        <div> R_ID</div>
        <div> Dataset</div>
      </div>
      <div className='flex items-center w-1/2 gap-x-5 sm:gap-x-14 xl:gap-x-[5.5rem]    sm:-ml-2'>
        <div> Date</div>
        <div> User</div>
      </div>
    </div>
  )
}

export default function ApprovalHeader() {
  return (
    <TableHeader leftNode={<LeftNode />} leftstyle='py-2' rightStyle='py-2' />
  )
}
