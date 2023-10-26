import React from 'react'
import Pagination from './pagination'

export default function TableHeader({
  rightNode,
  leftNode,
}: { rightNode?: React.ReactNode; leftNode?: React.ReactNode }) {
  return (
    <div className='flex w-full outline h-[72px] items-center'>
      <div className='flex shrink grow outline'>
        {rightNode && rightNode}
      </div>
      <div className='ml-auto flexjustify-end gap-x-3'>
        {leftNode && leftNode}
        <Pagination />
      </div>
    </div>
  )
}
