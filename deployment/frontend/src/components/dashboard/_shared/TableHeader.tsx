import React from 'react'
import Pagination from './Pagination'


export default function TableHeader({
  rightNode,
  leftNode,
  leftstyle,
  rightStyle
}: { rightNode?: React.ReactNode; leftNode?: React.ReactNode, leftstyle?: string, rightStyle?: string }) {
  return (
    <div className='flex w-full h-[72px] items-center'>
      <div className={`flex grow shrink ${leftstyle}`}>
        {leftNode && leftNode}
      </div>
      <div className={`ml-auto flex justify-end gap-x-3  ${rightStyle}`}>
        {rightNode && rightNode}
        <Pagination />
      </div>
    </div>
  )
}
