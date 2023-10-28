import React from 'react'
import Pagination from './Pagination'


export default function TableHeader({
  rightNode,
  leftNode,
  leftstyle,
  rightStyle
}: { rightNode?: React.ReactNode; leftNode?: React.ReactNode, leftstyle?: string, rightStyle?: string }) {
  return (
    <div className='flex w-full h-[72px] sm:items-center gap-y-4 flex-col sm:flex-row'>
      <div className={`flex grow shrink ${leftstyle}`}>
        {leftNode && leftNode}
      </div>
      <div className={`ml-auto flex flex-col sm:flex-row justify-end gap-x-3 gap-y-3  ${rightStyle}`}>
        {rightNode && rightNode}
        <Pagination />
      </div>
    </div>
  )
}
