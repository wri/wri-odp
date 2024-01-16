import React, { useState } from 'react'
import ApprovalHeader from './ApprovalHeader'
import ApprovalRow from './ApprovalRow'
import { api } from '@/utils/api'
import Spinner from '@/components/_shared/Spinner'
import RejectApproval from './RejectApproval'
import { WriDataset } from '@/schema/ckan.schema'
import Modal from '@/components/_shared/Modal'
import { LoaderButton, Button } from '@/components/_shared/Button'
import { InformationCircleIcon } from '@heroicons/react/24/outline'
import { Dialog } from '@headlessui/react'
import { ErrorAlert } from '@/components/_shared/Alerts'
import { SearchInput } from '@/schema/search.schema'
import Pagination from '@/components/dashboard/_shared/Pagination'
import { useSession } from 'next-auth/react'

export default function Approvallist() {
    const { data: session } = useSession()
    const [rejectOpen, setRejectOpen] = useState(false)
    const [approveOpen, setApproveOpen] = useState(false)
    const [selectDataset, setSelectDataset] = useState<WriDataset | null>(null)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const { data: userIdentity, isLoading: isLoadingIUser } =
        api.user.getUserCapacity.useQuery()
    const [query, setQuery] = useState<SearchInput>({
        search: '',
        page: { start: 0, rows: 10 },
        sortBy: 'metadata_modified desc',
    })
    const { data, isLoading, refetch } =
        api.dataset.getPendingDatasets.useQuery(query)

    const approveDataset = api.dataset.approvePendingDataset.useMutation({
        onSuccess: async (data) => {
            await refetch()
            setApproveOpen(false)
        },
        onError: (error) => setErrorMessage(error.message),
    })

    const handleOpenModal = (
        dataset: WriDataset,
        approvalType: 'approve' | 'reject'
    ) => {
        setSelectDataset(dataset)
        if (approvalType === 'approve') {
            setApproveOpen(true)
        } else {
            setRejectOpen(true)
        }
    }

    if (!session?.user.sysadmin && isLoadingIUser) {
        return <Spinner className="mx-auto my-2" />
    }

    if (!session?.user.sysadmin && userIdentity && !userIdentity.isOrgAdmin) {
        return (
            <div className="flex justify-center items-center h-screen">
                You are not authorized to access this page
            </div>
        )
    }

    //TODO: might need to change ApprovalHeader and Approval Row to make use of table
    // layout incase of styling misalignment
    return (
        <section
            id="approval"
            className=" max-w-sm sm:max-w-8xl  w-full flex flex-col gap-y-5 sm:gap-y-0"
        >
            {errorMessage && (
                <div className="py-4">
                    <ErrorAlert text={errorMessage} />
                </div>
            )}

            <ApprovalHeader
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
                {isLoading ? (
                    <Spinner className="mx-auto my-2" />
                ) : data && data.datasets.length === 0 ? (
                    <div className="flex justify-center items-center h-screen">
                        No data
                    </div>
                ) : (
                    data?.datasets.map((approvalInfo, index) => (
                        <ApprovalRow
                            key={index}
                            approvalInfo={approvalInfo}
                            handleOpenModal={handleOpenModal}
                            className={
                                index % 2 === 0
                                    ? ' bg-wri-row-gray hover:bg-wri-slate'
                                    : ''
                            }
                        />
                    ))
                )}
            </div>

            {selectDataset && (
                <Modal
                    open={rejectOpen}
                    setOpen={setRejectOpen}
                    className="sm:w-full sm:max-w-lg"
                >
                    <RejectApproval
                        dataset={selectDataset}
                        setRejectOpen={() => setRejectOpen(false)}
                    />
                </Modal>
            )}
            {selectDataset && (
                <Modal
                    open={approveOpen}
                    setOpen={setApproveOpen}
                    className="sm:w-full sm:max-w-lg"
                >
                    <div className="sm:flex sm:items-start">
                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                            <InformationCircleIcon
                                className="h-6 w-6 text-green-600"
                                aria-hidden="true"
                            />
                        </div>
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                            <Dialog.Title
                                as="h3"
                                className="text-base font-semibold leading-6 text-gray-900"
                            >
                                Approve Dataset
                            </Dialog.Title>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                    Are you sure you want to approve this
                                    dataset?
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-5 sm:mt-4 gap-x-4 sm:flex sm:flex-row-reverse">
                        <LoaderButton
                            variant="destructive"
                            loading={approveDataset.isLoading}
                            onClick={() =>
                                approveDataset.mutate({ id: selectDataset.id })
                            }
                        >
                            Approve Dataset
                        </LoaderButton>
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => setApproveOpen(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </Modal>
            )}
        </section>
    )
}
