import React, { useEffect, useState } from 'react'
import SearchHeader from '../_shared/SearchHeader'
import RowProfile from '../_shared/RowProfile';
import Row from '../_shared/Row';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
import type { IRowProfile } from '../_shared/RowProfile';
import { api } from '@/utils/api';
import Spinner from '@/components/_shared/Spinner';
import type { SearchInput } from '@/schema/search.schema';
import Pagination from '../_shared/Pagination';
import type { GroupTree } from '@/schema/ckan.schema';
import notify from '@/utils/notify'
import dynamic from 'next/dynamic';
const Modal = dynamic(() => import('@/components/_shared/Modal'), {
    ssr: false,
});;
import { useRouter } from 'next/router'
import { LoaderButton, Button } from '@/components/_shared/Button'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Dialog } from '@headlessui/react'
import Image from 'next/image'
import type { Application } from '@/schema/ckan.schema'


function ApplicationProfile({ application }: { application: Application }) {
  return (
    <div className='flex py-5 pl-2' >
        <div className="flex flex-row gap-x-4 hover:bg-slate-100  rounded-md">
            <div className="flex gap-x-4">
                <div
                    className="relative rounded-md w-16 h-16 bg-[#F9F9F9]"
                >
                    <Image
                        src={
                            application?.image_display_url
                                ? application.image_display_url
                                : '/images/placeholders/applications/applicationsdefault.png'                        }
                        alt=""
                        className="rounded-md object-cover"
                        fill
                    />
                </div>
            </div>
            <div className="flex flex-col py-3">
                <p className="font-normal text-base">
                    {application?.title || application.name}
                </p>
                {application?.description ? (
                    <span className="text-[#666666] font-tight text-[12px] ">
                        {application.description}
                    </span>
                ) : (
                    ''
                )}
            </div>
        </div>
    </div>
  )
}

export default function ApplicationCard() {
  const [query, setQuery] = useState<SearchInput>({ search: '', page: { start: 0, rows: 10 } })
  const { data: applications , isLoading, refetch } = api.applications.getAllApplications.useQuery()
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const deleteApplication = api.applications.deleteDashBoardApplication.useMutation({
    onSuccess: async (data) => {
      await refetch();
      setOpen(false)
      notify(`Successfully deleted the ${selectedApplication?.name} application`, 'error')
    }
  })

  const handleOpenModal = (application: Application) => {
    setSelectedApplication(application)
    setOpen(true)
  }

  const filteredApplications = applications?.filter((application) => {
    return application.name.toLowerCase().includes(query.search.toLowerCase())
  })
  const paginatedApplications = filteredApplications?.slice(query.page.start, query.page.start + query.page.rows)

  return (
    <section className='w-full max-w-8xl flex flex-col gap-y-5 sm:gap-y-0'>
      <SearchHeader leftStyle=' sm:pr-2 sm:pl-12' rightStyle=' px-2 sm:pr-6' setQuery={setQuery} query={query} Pagination={<Pagination setQuery={setQuery} query={query} isLoading={isLoading} count={filteredApplications?.length ?? 0} />} />
      <div className='w-full'>
        {
          (isLoading || !paginatedApplications) ? <div className='flex justify-center items-center h-screen'><Spinner className="mx-auto my-2" /></div> : (
            paginatedApplications.map((application, index) => {
              return (
                <div key={application.name}>
                  <Row
                    key={index}
                    className={`pr-6`}
                    highlighted={false}
                    rowMain={<ApplicationProfile application={application} />}
                    linkButton={{
                      label: "View application",
                      link: `../applications/${application.name}`,
                    }}
                    controlButtons={[
                      {
                        label: "Edit",
                        color: 'bg-wri-gold hover:bg-yellow-400',
                        icon: <PencilSquareIcon className='w-4 h-4 text-white' />,
                        tooltip: {
                          id: `edit-tooltip-${application.name}`,
                          content: "Edit application"
                        },
                        onClick: () => {
                          router.push(`/dashboard/applications/${application.name}/edit`)
                        }
                      },
                      {
                        label: "Delete",
                        color: 'bg-red-600 hover:bg-red-500',
                        icon: <TrashIcon className='w-4 h-4 text-white' />,
                        tooltip: {
                          id: `delete-tooltip-${application.name}`,
                          content: "Delete application"
                        },
                        onClick: () => handleOpenModal(application)
                      },
                    ]}
                    rowSub={null}
                    isDropDown={false}
                  />
                </div>

              )
            })
          )
        }

        {
          selectedApplication && (
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
                    Delete Application
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this application?
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 gap-x-4 sm:flex sm:flex-row-reverse">
                <LoaderButton
                  variant="destructive"
                  loading={deleteApplication.isLoading}
                  onClick={() => deleteApplication.mutate(selectedApplication.id)}
                  id={selectedApplication.name}
                >
                  Delete Application
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
          )
        }

      </div>
    </section>
  )
}
