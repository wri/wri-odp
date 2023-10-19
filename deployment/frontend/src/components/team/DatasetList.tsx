import React from 'react'
import DatasetHorizontalCard from '../search/DatasetHorizontalCard'
import Pagination from '@/components/_shared/Pagination'

export default function DatasetList({ datasets }: { datasets: number[] }) {
  return (
    <section id="datasetslist" className='w-full px-8 xxl:px-0 max-w-[1317px] xxl:mx-auto flex flex-col gap-y-2 mt-10'>

      <h1 className=' font-semibold text-[24px] text-center sm:text-start'>Dataset associated with Topic 1 (784)</h1>
      {
        datasets.map((dataset, index) => (
          <DatasetHorizontalCard key={index} />
        ))
      }
      <Pagination />
    </section>
  )
}
