import React from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import type { SearchInput } from '@/schema/search.schema'
import Spinner from '@/components/_shared/Spinner'

export default function Pagination({ setQuery, query, isLoading, count }: {
  setQuery: React.Dispatch<React.SetStateAction<SearchInput>>,
  query: SearchInput,
  isLoading?: boolean,
  count?: number
}) {

  const handlePageChange = (page: number) => {

    if (setQuery && query && (page >= 0 && page < count!)) {
      const updateQuery: SearchInput = { ...query, page: { ...query.page, start: page }, search: query.search }
      setQuery(updateQuery)
    }
  }

  return (
    <div className='flex font-acumin gap-x-2 items-center self-end'>
      {isLoading ? <Spinner className="mx-auto my-2" /> :
        <div className=' text-gray-300 font-light text-sm'>{`${query.page.start === 0 ? 0 : Math.floor(query.page.start / query.page.rows)} of ${Math.round(count! / query.page.rows)}`}</div>}

      <button
        onClick={() => handlePageChange(query.page.start - query.page.rows)}
      >
        <ChevronLeftIcon className='w-5 h-5 text-wri-gray' />
      </button>
      <button
        onClick={() => handlePageChange(query.page.start + query.page.rows)}
      >
        <ChevronRightIcon className='w-5 h-5 text-wri-black' />
      </button>
    </div>
  )
}
