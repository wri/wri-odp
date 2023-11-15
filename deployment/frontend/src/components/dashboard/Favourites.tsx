import React, { useState } from 'react'
import { ArrowPathIcon, ArrowRightIcon, Squares2X2Icon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { api } from '@/utils/api'
import type { SearchInput } from '@/schema/search.schema';
import type { WriDataset } from '@/schema/ckan.schema';
import { formatDate } from '@/utils/general';

function Favourite({ dataset }: { dataset: WriDataset }) {
  const created = dataset?.metadata_created ? dataset.metadata_created : ''
  return (
    <div className='flex flex-col hover:bg-slate-100 px-3 py-2 mb-2 pb-2 rounded-md'>
      <p className='font-normal text-base'>{dataset?.title ?? dataset?.name}</p>
      <div className='flex '>
        <ArrowPathIcon className='w-3 h-3  text-[#3654A5] mt-[2px]' />
        <div className='ml-1 w-fit h-[12px] text-[12px]'>
          {formatDate(created)}
        </div>
      </div>
    </div>
  )
}
export default function Favourites({ drag }: { drag: boolean }) {
  const [query, setQuery] = useState<SearchInput>({ search: '', page: { start: 0, rows: 7 } })
  const { data, isLoading } = api.dataset.getFavoriteDataset.useQuery(query)
  return (
    <section id="favourites" className={`p-6 w-full shadow-wri h-full overflow-y-auto ${drag ? "border-dashed border border-wri-black" : ""}`}>
      {
        drag ? (
          <div className='absolute top-0 -left-5'>
            <Squares2X2Icon className='w-4 h-4 text-wri-black' />
          </div>
        ) : ""
      }
      <div className='flex px-2 mb-4 border-b-[0.3px] border-b-gray-100'>
        <p className='font-normal text-[20px]'>My Favourites</p>
        <Link href="/dashboard/datasets" className='ml-auto flex items-center font-semibold gap-x-1 text-[14px] text-wri-green'><span>See all</span> <ArrowRightIcon className='w-4 h-4 mb-1' /></Link>
      </div>
      {
        data?.datasets.length === 0 ? <div className='flex justify-center items-center h-screen'>No data</div> :
          data?.datasets.map((items, index) => {
            return (
              <Favourite key={index} dataset={items} />
            )
          })
      }
    </section>

  )
}
