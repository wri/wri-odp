import React from 'react'
import Pagination from './Pagination'

export default function TableHeader({
  rightNode,
  leftNode,
}: { rightNode?: React.ReactNode; leftNode?: React.ReactNode }) {
  return (
    <div className='flex w-full h-[72px] items-center'>
      <div className='flex shrink grow '>
        {leftNode && leftNode}
      </div>
      <div className='ml-auto flex justify-end gap-x-3'>
        {rightNode && rightNode}
        <Pagination />
      </div>
    </div>
  )
}
