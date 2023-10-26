import React from 'react'
import TableHeader from '../_shared/TableHeader'


function LeftNode() {
  return (
    <div className=' flex font-normal text-base w-full  lg:max-w-[75%] xl:max-w-[80%] pl-10'>
      <div className='flex items-center w-[36%] lg:w-1/2 gap-x-5 '>
        <div> R_ID</div>
        <div> Dataset</div>
      </div>
      <div className='flex items-center w-1/2 gap-x-8 xl:gap-x-[5.5rem]  xl:-ml-2'>
        <div> Date</div>
        <div> User</div>
      </div>
    </div>
  )
}

export default function ApprovalHeader() {
  return (
    <TableHeader leftNode={<LeftNode />} />
  )
}
