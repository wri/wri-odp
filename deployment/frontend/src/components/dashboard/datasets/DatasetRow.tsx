import React, { useState } from 'react'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import Row from '../_shared/Row'
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { WriDataset } from '@/schema/ckan.schema';
import { formatDate } from '@/utils/general';
import Modal from '@/components/_shared/Modal';
import { api } from '@/utils/api'
import notify from '@/utils/notify'
import Spinner from '@/components/_shared/Spinner';


function subFields(dataset: WriDataset) {
  return [
    {
      title: "Status",
      description: "RDI Approved"
    },
    {
      title: "Type of Dataset",
      description: dataset?.type
    },
    {
      title: "Coverage",
      description: dataset?.temporal_coverage
    },
    {
      title: "Short description",
      description: dataset?.short_description
    },
    {
      title: "Technical Notes",
      description: dataset?.technical_notes
    },
    {
      title: "Team",
      description: dataset?.organization?.title
    },
    {
      title: "Region",
      description: "Sub-regional"
    }
  ]
}

function DatasetCardProfile({ dataset }: { dataset: WriDataset }) {
  const created = dataset?.metadata_created ? dataset.metadata_created : ''
  return (
    <div className='flex flex-col p-1 py-3 rounded-md pl-4 sm:pl-14'>
      <p className='font-semibold text-[15px]'>{dataset?.title ?? dataset?.name}</p>
      <div className='flex font-normal'>
        <ArrowPathIcon className='w-3 h-3  text-[#3654A5] mt-[2px]' />
        <div className='ml-1 w-fit h-[12px] text-[12px] text-[#666666]'>
          {formatDate(created)}
        </div>
      </div>
    </div>
  )
}

function SubCardProfile({ dataset }: { dataset: WriDataset }) {
  const status = subFields(dataset)
  return (
    <div>
      <div className='ml-14  w-[90%] outline outline-1 outline-wri-gray'></div>
      <div className='grid grid-cols-2 grid-rows-4 sm:grid-cols-4 sm:grid-rows-2 gap-x-5 gap-y-2 sm:gap-y-0 px-2 pt-4  sm:pl-14 sm:pr-20 sm:pt-4'>
        {status.map((item, index) => {
          return (
            <div key={index} className='flex flex-col'>
              <p className='font-semibold text-[15px]'>{item.title}</p>
              <p className='font-normal text-[14px] text-[#4B4B4B]'>{item.description}</p>
            </div>
          )
        })}
      </div>
    </div>

  )
}

export default function DatasetRow({ className, dataset }: { className?: string, dataset: WriDataset }) {
  const utils = api.useUtils()
  const [open, setOpen] = useState(false)
  const datasetDelete = api.dataset.deleteDataset.useMutation({
    onSuccess: async (data) => {
      setOpen(false)
      await utils.dataset.getAllDataset.invalidate({ search: '', page: { start: 0, rows: 5 } })
      notify(`Dataset delete is successful`, 'success')

    },
  })
  return (
    <>
      <Row
        className={`pr-2 sm:pr-4 ${className ? className : ''}`}
        rowMain={<DatasetCardProfile dataset={dataset} />}
        controlButtons={[
          { label: "Edit", color: 'bg-wri-gold hover:bg-yellow-400', icon: <PencilSquareIcon className='w-4 h-4 text-white' />, onClick: () => { } },
          { label: "Delete", color: 'bg-red-600 hover:bg-red-500', icon: <TrashIcon className='w-4 h-4 text-white' />, onClick: () => setOpen(true) },
        ]}
        linkButton={{
          label: "View dataset",
          link: "#",
        }}
        rowSub={<SubCardProfile dataset={dataset} />}
        isDropDown
      />

      <Modal open={open} setOpen={setOpen} className="max-w-[36rem] font-acumin flex flex-col gap-y-4">
        <h3 className='w-full text-center my-auto'>Delete Dataset: {dataset.name}</h3>
        <button
          className=' w-full bg-red-500 text-white rounded-lg text-md py-2 flex justify-center items-center'
          onClick={() => {
            datasetDelete.mutate(dataset.id)
          }}
        >{datasetDelete.isLoading ? <Spinner className='w-4 mr-4' /> : ""}{" "}{datasetDelete.isError ? "Something went wrong Try again" : "I want to delete this dataset"} </button>
      </Modal>
    </>

  )
}

export function MyDatasetRow({ className, dataset }: { className?: string, dataset: WriDataset }) {
  const utils = api.useUtils()
  const [open, setOpen] = useState(false)
  const datasetDelete = api.dataset.deleteDataset.useMutation({
    onSuccess: async (data) => {
      setOpen(false)
      await utils.dataset.getMyDataset.invalidate({ search: '', page: { start: 0, rows: 2 } })
      notify(`Dataset delete is successful`, 'success')

    },
  })
  return (
    <>
      <Row
        className={`pr-2 sm:pr-4 ${className ? className : ''}`}
        rowMain={<DatasetCardProfile dataset={dataset} />}
        controlButtons={[
          { label: "Edit", color: 'bg-wri-gold hover:bg-yellow-400', icon: <PencilSquareIcon className='w-4 h-4 text-white' />, onClick: () => { } },
          { label: "Delete", color: 'bg-red-600 hover:bg-red-500', icon: <TrashIcon className='w-4 h-4 text-white' />, onClick: () => setOpen(true) },
        ]}
        linkButton={{
          label: "View dataset",
          link: "#",
        }}
        rowSub={<SubCardProfile dataset={dataset} />}
        isDropDown
      />

      <Modal open={open} setOpen={setOpen} className="max-w-[36rem] font-acumin flex flex-col gap-y-4">
        <h3 className='w-full text-center my-auto'>Delete Dataset: {dataset.name}</h3>
        <button
          className=' w-full bg-red-500 text-white rounded-lg text-md py-2 flex justify-center items-center'
          onClick={() => {
            datasetDelete.mutate(dataset.id)
          }}
        >{datasetDelete.isLoading ? <Spinner className='w-4 mr-4' /> : ""}{" "}{datasetDelete.isError ? "Something went wrong Try again" : "I want to delete this dataset"} </button>
      </Modal>
    </>

  )
}



export function FavouriteRow({ className, dataset }: { className?: string, dataset: WriDataset }) {
  return (
    <Row
      className={`pr-2 sm:pr-4  ${className ? className : ''}`}
      rowMain={<DatasetCardProfile dataset={dataset} />}
      linkButton={{
        label: "View dataset",
        link: "#",
      }}
      rowSub={<SubCardProfile dataset={dataset} />}
      isDropDown
    />
  )
}

export function DraftRow({ className, dataset }: { className?: string, dataset: WriDataset }) {
  const utils = api.useUtils()
  const [open, setOpen] = useState(false)
  const datasetDelete = api.dataset.deleteDataset.useMutation({
    onSuccess: async (data) => {
      setOpen(false)
      await utils.dataset.getDraftDataset.invalidate({ search: '', page: { start: 0, rows: 2 } })
      notify(`Dataset delete is successful`, 'success')

    },
  })
  return (
    <>
      <Row
        className={`pr-2 sm:pr-4 ${className ? className : ''}`}
        rowMain={<DatasetCardProfile dataset={dataset} />}
        controlButtons={[
          { label: "Edit", color: 'bg-wri-gold hover:bg-green-400', icon: <PencilSquareIcon className='w-4 h-4 text-white' />, onClick: () => { } },
          { label: "Delete", color: 'bg-red-600 hover:bg-red-500', icon: <TrashIcon className='w-4 h-4 text-white' />, onClick: () => setOpen(true) },
        ]}
        rowSub={<SubCardProfile dataset={dataset} />}
        isDropDown
      />
      <Modal open={open} setOpen={setOpen} className="max-w-[36rem] font-acumin flex flex-col gap-y-4">
        <h3 className='w-full text-center my-auto'>Delete Dataset: {dataset.name}</h3>
        <button
          className=' w-full bg-red-500 text-white rounded-lg text-md py-2 flex justify-center items-center'
          onClick={() => {
            datasetDelete.mutate(dataset.id)
          }}
        >{datasetDelete.isLoading ? <Spinner className='w-4 mr-4' /> : ""}{" "}{datasetDelete.isError ? "Something went wrong Try again" : "I want to delete this dataset"} </button>
      </Modal>
    </>
  )
}