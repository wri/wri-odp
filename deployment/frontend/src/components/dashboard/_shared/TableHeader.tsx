import React from 'react'



export default function TableHeader({
  rightNode,
  leftNode,
  leftstyle,
  rightStyle,
  Pagination
}: {
  rightNode?: React.ReactNode;
  leftNode?: React.ReactNode,
  leftstyle?: string,
  rightStyle?: string,
  Pagination?: React.ReactNode
}) {
  return (
    <div className='flex w-full  sm:items-center gap-y-4 flex-col sm:flex-row py-2'>
      <div className={`flex grow shrink ${leftstyle}`}>
        {leftNode && leftNode}
      </div>
      <div className={`ml-auto flex flex-col sm:flex-row justify-end gap-x-3 gap-y-3 pr-4  ${rightStyle}`}>
        {rightNode && rightNode}
        {Pagination && Pagination}
      </div>
    </div>
  )
}
