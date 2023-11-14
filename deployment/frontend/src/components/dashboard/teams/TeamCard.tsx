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
  const [query, setQuery] = useState<SearchInput>({ search: '', page: { start: 0, rows: 5 } })
  const { data, isLoading, refetch } = api.organization.getUsersOrganizations.useQuery(query)
  const [selectedTeam, setSelectedTeam] = useState<IOrg | null>(null);
  const [open, setOpen] = useState(false)
  const deleteTeam = api.teams.deleteDashboardTeam.useMutation({
    onSuccess: async (data) => {
      await refetch();
      setOpen(false)
      notify(`Team delete is successful`, 'success')
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
                        onClick: () => { }
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
      {selectedTeam && (
        <Modal open={open} setOpen={setOpen} className="max-w-[36rem] font-acumin flex flex-col gap-y-4">
          <h3 className='w-full text-center my-auto'>Delete Teams: {selectedTeam.name}</h3>
          <button
            className=' w-full bg-red-500 text-white rounded-lg text-md py-2 flex justify-center items-center'
            id={selectedTeam.name}
            onClick={() => {
              deleteTeam.mutate(selectedTeam.name!)
            }}
          >{deleteTeam.isLoading ? <Spinner className='w-4 mr-4' /> : ""}{" "}{deleteTeam.isError ? "Something went wrong Try again" : "I want to delete this team"} </button>
        </Modal>
      )}
    </section>
  )
}
