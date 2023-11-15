import React from 'react'
import Row from '../_shared/Row'
import RowProfile from '../_shared/RowProfile'
import type { IRowProfile } from '../_shared/RowProfile'
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'


export type IApprovalRow = {
  dataset: string;
  rowId: string;
  user: IRowProfile;
  date: string;
  status: boolean;
}

function Card({ approvalInfo }: { approvalInfo: IApprovalRow }) {

  return (
    <div className='flex flex-col sm:flex-row gap-y-3 sm:items-center lg:max-w-[98%] xl:max-w-[85.5%] py-2 pt-4 sm:pt-2 sm:pl-6 w-full font-normal text-[15px]'>
      {approvalInfo.status && (<div className='w-2 h-2 rounded-full bg-wri-gold my-auto hidden sm:block'></div>)}
      <div className='flex items-center sm:w-[40%] xl:w-1/2 gap-x-8 ml-2'>

        <div className='flex gap-x-2'>
          {approvalInfo.status && (<div className='w-2 h-2 rounded-full bg-wri-gold my-auto sm:hidden'></div>)}
          <div>{approvalInfo.rowId}</div>
        </div>
        <div className=' line-clamp-1'> {approvalInfo.dataset}</div>
      </div>
      <div className='flex flex-col sm:flex-row ml-4 gap-y-2 sm:ml-0 sm:items-center gap-x-8 sm:w-[60%]  lg:w-1/2 sm:gap-x-6 lg:gap-x-12'>
        <div className='order-last sm:order-first'> {approvalInfo.date}</div>
        <RowProfile profile={approvalInfo.user} imgStyle='w-8 h-8 mt-2' isPad />
      </div>
    </div>
  )
}

export default function ApprovalRow({ approvalInfo, className }: { approvalInfo: IApprovalRow, className: string }) {
  return (
    <Row
      className={`sm:pr-4 ${className ? className : ''}`}
      rowMain={<Card approvalInfo={approvalInfo} />}
      controlButtons={[
        { label: "Edit", color: 'bg-wri-green hover:bg-green-500', icon: <CheckIcon className='w-4 h-4 text-white' />, onClick: () => { } },
        { label: "Delete", color: 'bg-red-600 hover:bg-red-500', icon: <XMarkIcon className='w-4 h-4 text-white' />, onClick: () => { } },
      ]}
      linkButton={{
        label: "Review",
        link: "/datasets/x?approval=true",
      }}

    />
  )
}
