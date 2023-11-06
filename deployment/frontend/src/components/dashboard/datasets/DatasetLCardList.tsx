import React from 'react'
import DatasetHeader from './DatasetHeader'
import DatasetRow from './DatasetRow'
import { api } from '@/utils/api'
import Spinner from '@/components/_shared/Spinner';

export default function DatasetLCardList() {
  const { data, isLoading } = api.dataset.getAllDataset.useQuery()


  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <Spinner className="mx-auto my-2" />
      </div>
    )
  }


  return (
    <section className='w-full max-w-sm sm:max-w-8xl flex  flex-col gap-y-20 sm:gap-y-0'>
      <DatasetHeader />
      <div className='w-full'>
        {
          data?.datasets.length === 0 ? <div className='flex justify-center items-center h-screen'>No data</div> :
            data?.datasets.map((items, index) => {
              return (
                <DatasetRow key={index} dataset={items} className={index % 2 === 0 ? ' bg-wri-row-gray hover:bg-slate-100' : ''} />
              )
            })
        }
      </div>


    </section>
  )
}
