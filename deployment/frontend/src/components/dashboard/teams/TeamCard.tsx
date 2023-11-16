import React, { useState } from 'react'
import SearchHeader from '../_shared/SearchHeader'
import RowProfile from '../_shared/RowProfile';
import Row from '../_shared/Row';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
import type { IRowProfile } from '../_shared/RowProfile';
import { api } from '@/utils/api'
import Spinner from '@/components/_shared/Spinner';
import type { SearchInput } from '@/schema/search.schema';
import Pagination from '../_shared/Pagination';
import notify from '@/utils/notify'
import Modal from '@/components/_shared/Modal';
import { useRouter } from 'next/router'
import { LoaderButton, Button } from '@/components/_shared/Button'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Dialog } from '@headlessui/react'

type IOrg = {
  title: string | undefined;
  name: string | undefined;
  image_display_url: string | undefined;
  description: string;
}

function TeamProfile({ team }: { team: IRowProfile }) {

  return (
    <div className='flex py-3 pl-4 sm:pl-8'>
      <RowProfile imgStyle='w-16 h-16 bg-[#F9F9F9] group-hover:bg-white' isPad profile={team} />
    </div>
  )
}




export default function TeamCard() {
  const [query, setQuery] = useState<SearchInput>({ search: '', page: { start: 0, rows: 10 } })
  const { data, isLoading, refetch } = api.organization.getUsersOrganizations.useQuery(query)
  const [selectedTeam, setSelectedTeam] = useState<IOrg | null>(null);
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const deleteTeam = api.teams.deleteDashboardTeam.useMutation({
    onSuccess: async (data) => {
      await refetch();
      setOpen(false)
      notify(`Successfully deleted the ${selectedTeam?.title ?? selectedTeam?.name} team`, 'error')
    }
  })

  const handleOpenModal = (user: IOrg) => {
    setSelectedTeam(user);
    setOpen(true);
  };

  return (
    <section className='w-full max-w-8xl flex flex-col gap-y-4 sm:gap-y-0'>
      <SearchHeader leftStyle=' px-2 sm:pr-2 sm:pl-12' rightStyle='pr-2 sm:pr-6' setQuery={setQuery} query={query} Pagination={<Pagination setQuery={setQuery} query={query} isLoading={isLoading} count={data?.count} />} />
      {
        isLoading ? <div className='flex justify-center items-center h-screen'><Spinner className="mx-auto my-2" /></div> :
          data?.organizations.length === 0 ? <div className='flex justify-center items-center h-screen'>No Organization</div> :
            data?.organizations.map((team, index) => {
              return (
                <div key={team.name}>
                  <Row
                    key={index}
                    className={`pr-2`}
                    rowMain={<TeamProfile team={team} />}
                    linkButton={{
                      label: "View team",
                      link: "#",
                    }}
                    controlButtons={[
                      {
                        label: "Edit",
                        color: 'bg-wri-gold hover:bg-yellow-400',
                        icon: <PencilSquareIcon className='w-4 h-4 text-white' />,
                        tooltip: {
                          id: `edit-tooltip-${team.name}`,
                          content: "Edit team"
                        },
                        onClick: () => {
                          // on click go to /teams/:teamName
                          router.push(`/dashboard/teams/${team.name}/edit`)
                        }
                      },
                      {
                        label: "Delete", color: 'bg-red-600 hover:bg-red-500',
                        icon: <TrashIcon className='w-4 h-4 text-white' />,
                        tooltip: {
                          id: `delete-tooltip-${team.name}`,
                          content: "Delete team"
                        },
                        onClick: () => handleOpenModal(team)
                      },
                    ]}
                  />

                </div>

              )
            })
      }

      {
        selectedTeam && (
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
                  Delete Team
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete this team?
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 gap-x-4 sm:flex sm:flex-row-reverse">
              <LoaderButton
                variant="destructive"
                loading={deleteTeam.isLoading}
                onClick={() => deleteTeam.mutate(selectedTeam.name!)}
              >
                Delete Team
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
    </section>
  )
}
