import React from 'react'
import TableHeader from './TableHeader'
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";

function LeftNode({ placeholder }: { placeholder?: string }) {
  return (
    <div className=' px-2 py-4 gap-x-2 flex flex-row items-center min-w-fit  w-full bg-white'>
      <div className='grow shrink basis-auto'><input type="text" placeholder={`${placeholder ? placeholder : "Search by keywords"}`} className=' focus:outline-none outline-none border-none focus:border-none placeholder:text-[14px] text-[14px] font-light w-full' /></div>
      <div className=' my-auto'><MagnifyingGlassIcon className='w-4 h-4 text-wri-black' /></div>
    </div>
  )
}

export default function SearchHeader(
  { RightNode,
    rightStyle,
    leftStyle,
    placeholder }:
    { RightNode?: React.ReactNode, rightStyle?: string, leftStyle?: string, placeholder?: string }) {
  return (
    <TableHeader rightNode={RightNode} leftNode={<LeftNode placeholder={placeholder} />} rightStyle={rightStyle} leftstyle={leftStyle} />
  )
}
