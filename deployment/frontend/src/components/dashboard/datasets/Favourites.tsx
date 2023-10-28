import React from 'react'
import SearchHeader from '../_shared/SearchHeader'
import { FavouriteRow } from './DatasetRow'

export default function Favourite() {
  return (
    <section className='w-full max-w-8xl flex flex-col gap-y-5 sm:gap-y-0 '>
      <SearchHeader leftStyle='px-2 sm:pr-2 sm:pl-12' />
      <div className='w-full'>
        {
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((items, index) => {
            return (
              <FavouriteRow key={index} className={index % 2 === 0 ? ' bg-[#F9F9F9] hover:bg-slate-100' : ''} />
            )
          })
        }
      </div>
    </section>
  )
}
