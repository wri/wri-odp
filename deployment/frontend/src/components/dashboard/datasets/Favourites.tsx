import React from 'react'
import SearchHeader from '../_shared/SearchHeader'
import { FavouriteRow } from './DatasetRow'
import { api } from '@/utils/api'
import Spinner from '@/components/_shared/Spinner';

export default function Favourite() {
  const { data, isLoading } = api.dataset.getFavoriteDataset.useQuery()

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <Spinner className="mx-auto my-2" />
      </div>
    )
  }
  return (
    <section className='w-full max-w-8xl flex flex-col gap-y-5 sm:gap-y-0 '>
      <SearchHeader leftStyle='px-2 sm:pr-4 sm:pl-12' />
      <div className='w-full'>
        {
          data?.datasets.length === 0 ? <div className='flex justify-center items-center h-screen'>No data</div> :
            data?.datasets.map((items, index) => {
              return (
                <FavouriteRow key={index} dataset={items} className={index % 2 === 0 ? ' bg-wri-row-gray hover:bg-wri-slate' : ''} />
              )
            })
        }
      </div>
    </section>
  )
}
