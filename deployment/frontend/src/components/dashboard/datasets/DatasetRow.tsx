import React from 'react'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import Row from '../_shared/Row'
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

const status = [
  {
    title: "Status",
    description: "RDI Approved"
  },
  {
    title: "Type of Dataset",
    description: "XYZ type"
  },
  {
    title: "Coverage",
    description: "2019 - 2023"
  },
  {
    title: "Short description",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam"
  },
  {
    title: "Technical Notes",
    description: "https://source/to/original/data"
  },
  {
    title: "Team",
    description: "Land and Carbon Lab"
  },
  {
    title: "Region",
    description: "Sub-regional"
  }
]

function DatasetCardProfile() {
  return (
    <div className='flex flex-col p-1 py-3 rounded-md pl-14'>
      <p className='font-semibold text-[15px]'>Name of dataset</p>
      <div className='flex font-normal'>
        <ArrowPathIcon className='w-3 h-3  text-[#3654A5] mt-[2px]' />
        <div className='ml-1 w-fit h-[12px] text-[12px] text-[#666666]'>
          20 Sept 2022
        </div>
      </div>
    </div>
  )
}

function SubCardProfile() {
  return (
    <div>
      <div className='ml-14  w-[90%] outline outline-1 outline-wri-gray'></div>
      <div className='grid grid-cols-4 grid-rows-2 gap-x-5  pl-14 pr-20 pt-4'>
        {status.map((item, index) => {
          return (
            <div key={index} className='flex flex-col'>
              <p className='font-semibold text-[15px]'>{item.title}</p>
              <p className='font-normal text-[14px] text-[#4B4B4B]'>{item.description}</p>
            </div>
          )
        })}
      </div>
    </div>

  )
}

export default function DatasetRow({ className }: { className?: string }) {
  return (
    <Row
      className={`pr-2  ${className ? className : ''}`}
      rowMain={<DatasetCardProfile />}
      controlButtons={[
        { label: "Edit", color: 'bg-wri-gold', icon: <PencilSquareIcon className='w-4 h-4 text-white' />, onClick: () => { } },
        { label: "Delete", color: 'bg-red-600', icon: <TrashIcon className='w-4 h-4 text-white' />, onClick: () => { } },
      ]}
      linkButton={{
        label: "View dataset",
        link: "#",
      }}
      rowSub={<SubCardProfile />}
      isDropDown
    />
  )
}
