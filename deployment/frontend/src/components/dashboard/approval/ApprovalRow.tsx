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
    <div className='flex items-center max-w-[85.5%] py-2 pl-6 w-full font-normal text-[15px]'>
      {approvalInfo.status && (<div className='w-2 h-2 rounded-full bg-wri-gold my-auto'></div>)}
      <div className='flex items-center w-1/2 gap-x-8 ml-2'>
        <div> {approvalInfo.rowId}</div>
        <div> {approvalInfo.dataset}</div>
      </div>
      <div className='flex items-center w-1/2 xl:gap-x-12 '>
        <div> {approvalInfo.date}</div>
        <RowProfile profile={approvalInfo.user} imgStyle='w-8 h-8 mt-2' isPad />
      </div>
    </div>
  )
}

export default function ApprovalRow({ approvalInfo, className }: { approvalInfo: IApprovalRow, className: string }) {
  return (
    <Row
      className={`pr-2 ${className ? className : ''}`}
      rowMain={<Card approvalInfo={approvalInfo} />}
      controlButtons={[
        { label: "Edit", icon: <CheckIcon className='w-4 h-4 text-white' />, onClick: () => { } },
        { label: "Delete", icon: <XMarkIcon className='w-4 h-4 text-white' />, onClick: () => { } },
      ]}
      linkButton={{
        label: "Review",
        link: "#",
      }}

    />
  )
}
