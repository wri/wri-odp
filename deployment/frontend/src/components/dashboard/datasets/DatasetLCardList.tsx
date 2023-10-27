import React from 'react'
import DatasetHeader from './DatasetHeader'
import DatasetRow from './DatasetRow'

export default function DatasetLCardList() {
  return (
    <section className='w-full max-w-8xl '>
      <DatasetHeader />

      {
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((items, index) => {
          return (
            <DatasetRow key={index} className={index % 2 === 0 ? ' bg-[#F9F9F9] hover:bg-slate-100' : ''} />
          )
        })
      }
    </section>
  )
}
