import React from 'react'
import DatasetHorizontalCard from '../search/DatasetHorizontalCard'
import Pagination from '@/components/_shared/Pagination'
import {WriDataset} from '@/schema/ckan.schema'

export default function DatasetList({ datasets }: { datasets: WriDataset[] }) {
  return (
    <section id="datasetslist" className='w-full px-4 xxl:px-0 max-w-[1317px] xxl:mx-auto flex flex-col gap-y-2 mt-10 overflow-hidden'>

      <h1 className=' font-semibold text-[24px] text-center sm:text-start'>Dataset associated with Topic 1 (784)</h1>
      {
        datasets.map((dataset, index) => (
          <DatasetHorizontalCard dataset={dataset} key={index} />
        ))
      }
      <Pagination />
    </section>
  )
}
