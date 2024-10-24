import React, { useState } from 'react'
import SearchHeader from '../_shared/SearchHeader'
import { DraftRow } from './DatasetRow'
import { api } from '@/utils/api'
import Spinner from '@/components/_shared/Spinner'
import type { SearchInput } from '@/schema/search.schema'
import Pagination from '../_shared/Pagination'
import type { WriDataset } from '@/schema/ckan.schema'
import notify from '@/utils/notify'
import dynamic from 'next/dynamic'
const Modal = dynamic(() => import('@/components/_shared/Modal'), {
    ssr: false,
})
import { LoaderButton, Button } from '@/components/_shared/Button'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Dialog } from '@headlessui/react'

export default function Drafts({
    setQuery,
    query,
}: {
    setQuery: React.Dispatch<React.SetStateAction<SearchInput>>
    query: SearchInput
}) {
    const { data, isLoading, refetch } =
        api.dataset.getDraftDataset.useQuery(query)
    const [selectDataset, setSelectDataset] = useState<WriDataset | null>(null)
    const [open, setOpen] = useState(false)
    const datasetDelete = api.dataset.deleteDataset.useMutation({
        onSuccess: async (data) => {
            await refetch()
            setOpen(false)
            notify(
                `Successfully deleted the ${
                    selectDataset?.title ?? selectDataset?.name
                } dataset`,
                'error'
            )
        },
    })

    const handleOpenModal = (dataset: WriDataset) => {
        setSelectDataset(dataset)
        setOpen(true)
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spinner className="mx-auto my-2" />
            </div>
        )
    }

    return (
        <section className="w-full max-w-8xl flex flex-col gap-y-5 sm:gap-y-0">
            <SearchHeader
                leftStyle="px-2 sm:pr-2 sm:pl-12"
                setQuery={setQuery}
                query={query}
                Pagination={
                    <Pagination
                        setQuery={setQuery}
                        query={query}
                        isLoading={isLoading}
                        count={data?.count}
                    />
                }
            />
            <div className="w-full">
                {data?.datasets.length === 0 ? (
                    <div className="flex justify-center items-center h-screen">
                        No data
                    </div>
                ) : (
                    data?.datasets.map((items, index) => {
                        return (
                            <DraftRow
                                handleOpenModal={handleOpenModal}
                                key={index}
                                dataset={items}
                                className={
                                    index % 2 === 0
                                        ? ' bg-wri-row-gray hover:bg-wri-slate'
                                        : ''
                                }
                            />
                        )
                    })
                )}

                {selectDataset && (
                    <Modal
                        open={open}
                        setOpen={setOpen}
                        className="sm:w-full sm:max-w-lg"
                    >
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                <ExclamationTriangleIcon
                                    className="h-6 w-6 text-red-600"
                                    aria-hidden="true"
                                />
                            </div>
                            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                <Dialog.Title
                                    as="h3"
                                    className="text-base font-semibold leading-6 text-gray-900"
                                >
                                    Delete Dataset
                                </Dialog.Title>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                        Are you sure you want to delete this
                                        dataset?
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-5 sm:mt-4 gap-x-4 sm:flex sm:flex-row-reverse">
                            <LoaderButton
                                variant="destructive"
                                loading={datasetDelete.isLoading}
                                onClick={() =>
                                    datasetDelete.mutate(selectDataset.id)
                                }
                            >
                                Delete Dataset
                            </LoaderButton>
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </Modal>
                )}
            </div>
        </section>
    )
}
