import React, { useRef } from 'react'
import TableHeader from './TableHeader'
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import type { SearchInput } from '@/schema/search.schema';

function LeftNode({ placeholder, setQuery, query }:
  {
    placeholder?: string,
    setQuery: React.Dispatch<React.SetStateAction<SearchInput>>,
    query: SearchInput
  }) {

  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (inputRef.current) {
      const updateQuery: SearchInput = { page: query.page, search: inputRef.current.value }
      setQuery && setQuery(updateQuery)
    }
  }

  return (
    <form onSubmit={(e) => handleSubmit(e)} className='w-full'>
      <div className=' px-2 py-4 gap-x-2 flex flex-row items-center min-w-fit  w-full bg-white'>
        <div className='grow shrink basis-auto'><input type="text" ref={inputRef} placeholder={`${placeholder ? placeholder : "Search by keywords"}`} className=' focus:outline-none outline-none border-none focus:border-none focus:ring-0 focus:ring-offset-0 placeholder:text-[14px] text-[14px] font-light w-full' /></div>
        <button
          type='submit'
          className=' my-auto'>
          <MagnifyingGlassIcon className='w-4 h-4 text-wri-black' />
        </button>
      </div>
    </form>
  )
}

export default function SearchHeader(
  { RightNode,
    rightStyle,
    leftStyle,
    setQuery,
    query,
    placeholder,
    Pagination
  }:
    {
      RightNode?: React.ReactNode,
      rightStyle?: string,
      leftStyle?: string,
      placeholder?: string,
      setQuery: React.Dispatch<React.SetStateAction<SearchInput>>,
      query: SearchInput,
      Pagination: React.ReactNode
    }) {
  return (
    <TableHeader
      rightNode={RightNode}
      leftNode={<LeftNode placeholder={placeholder} setQuery={setQuery} query={query} />}
      rightStyle={rightStyle} leftstyle={leftStyle}
      Pagination={Pagination}
    />
  )
}
