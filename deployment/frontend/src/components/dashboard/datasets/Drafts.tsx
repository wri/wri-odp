import React, { useState } from 'react'
import SearchHeader from '../_shared/SearchHeader'
import { DraftRow } from './DatasetRow'
import { api } from '@/utils/api'
import Spinner from '@/components/_shared/Spinner';
import type { SearchInput } from '@/schema/search.schema';
import Pagination from '../_shared/Pagination';
import type { WriDataset } from '@/schema/ckan.schema';
import notify from '@/utils/notify'
import Modal from '@/components/_shared/Modal';

export default function Drafts() {
  const [query, setQuery] = useState<SearchInput>({ search: '', page: { start: 0, rows: 10 } })
  const { data, isLoading, refetch } = api.dataset.getDraftDataset.useQuery(query)
  const [selectDataset, setSelectDataset] = useState<WriDataset | null>(null)
  const [open, setOpen] = useState(false)
  const datasetDelete = api.dataset.deleteDataset.useMutation({
    onSuccess: async (data) => {
      await refetch();
      setOpen(false)
      notify(`Dataset delete is successful`, 'success')
    },
  })

  const handleOpenModal = (dataset: WriDataset) => {
    setSelectDataset(dataset)
    setOpen(true);
  }

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <Spinner className="mx-auto my-2" />
      </div>
    )
  }

  return (
    <section className='w-full max-w-8xl flex flex-col gap-y-5 sm:gap-y-0'>
      <SearchHeader leftStyle='px-2 sm:pr-2 sm:pl-12' setQuery={setQuery} query={query} Pagination={<Pagination setQuery={setQuery} query={query} isLoading={isLoading} count={data?.count} />} />
      <div className='w-full'>
        {
          data?.datasets.length === 0 ? <div className='flex justify-center items-center h-screen'>No data</div> :
            data?.datasets.map((items, index) => {
              return (
                <DraftRow handleOpenModal={handleOpenModal} key={index} dataset={items} className={index % 2 === 0 ? ' bg-wri-row-gray hover:bg-wri-slate' : ''} />
              )
            })
        }
        {
          selectDataset && (
            <Modal open={open} setOpen={setOpen} className="max-w-[36rem] font-acumin flex flex-col gap-y-4">
              <h3 className='w-full text-center my-auto'>Delete Dataset: {selectDataset.title}</h3>
              <button
                id={selectDataset.name}
                className=' w-full bg-red-500 text-white rounded-lg text-md py-2 flex justify-center items-center'
                onClick={() => {
                  datasetDelete.mutate(selectDataset.id)
                }}
                disabled={datasetDelete.isSuccess}
              >{datasetDelete.isLoading ?? isLoading ? <Spinner className='w-4 mr-4' /> : ""}{" "}{datasetDelete.isError ? "Something went wrong Try again" : "I want to delete this dataset"} </button>
            </Modal>
          )
        }
      </div>
    </section>
  )
}
