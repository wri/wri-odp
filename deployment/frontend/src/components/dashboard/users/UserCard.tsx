import React, { useState } from 'react'
import SearchHeader from '../_shared/SearchHeader'
import RowProfile from '../_shared/RowProfile';
import Row from '../_shared/Row';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
import type { IRowProfile } from '../_shared/RowProfile';
import { api } from '@/utils/api';
import Spinner from '@/components/_shared/Spinner';
import type { SearchInput } from '@/schema/search.schema';
import Pagination from '../_shared/Pagination';
import notify from '@/utils/notify'
import Modal from '@/components/_shared/Modal';

type IUser = {
  title?: string;
  id: string;
  description?: string;
  orgnumber?: number;
  image_display_url?: string;
  orgs?:
  {
    title?: string;
    capacity?: string;
    image_display_url?: string;
    name?: string;
  }[]
}


function TeamProfile({ user }: { user: IRowProfile | IUser }) {

  const UserProfile = user as IUser
  return (
    <div className='flex flex-col sm:flex-row py-3 pl-4 sm:pl-8 gap-x-14 gap-y-6'>
      <RowProfile imgStyle='w-16 h-16 bg-[#F9F9F9] group-hover:bg-white' isPad profile={user as IRowProfile} />
      <div className='font-normal text-base sm:text-[14px] text-wri-black sm:self-center sm:ml-auto sm:mr-[20%] lg:mr-[46%]'>
        {UserProfile?.orgnumber ? `Member of ${UserProfile?.orgnumber} Teams` : "No Teams"}
      </div>
    </div>
  )
}

function SubCardProfile({ user }: { user: IRowProfile | IUser }) {
  const utils = api.useUtils()
  const [open, setOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<{ name?: string } | null>(null);
  const removeMember = api.user.deleteMember.useMutation({
    onSuccess: async (data) => {
      await utils.user.getAllUsers.invalidate({ search: '', page: { start: 0, rows: 2 } })
      setOpen(false)
      notify(`Member removed successful`, 'success')
    },
  })

  const handleOpenModal = (team: { name?: string }) => {
    setSelectedTeam(team);
    setOpen(true);
  };

  const UserProfile = user as IUser
  if (UserProfile?.orgnumber === 0) return (<></>)

  return (
    <div className='flex flex-col pt-2'>
      {
        UserProfile?.orgs?.map((team, index) => {
          return (
            <div key={team.name}>
              <Row
                key={index}
                groupStyle="group/item group-hover/item:visible "
                className={`pr-6 border-b-[1px] border-wri-gray `}
                rowMain={
                  <div className='flex flex-col sm:flex-row pl-3 sm:pl-5  gap-x-14 gap-y-4'>
                    <RowProfile imgStyle='w-8 h-8 mt-2' isPad profile={team as IRowProfile} />
                    <div className='font-normal text-[14px] text-wri-black sm:self-center sm:ml-auto sm:mr-[40%] lg:mr-[60%]'>{team.capacity}</div>
                  </div>
                }
                controlButtons={[
                  {
                    label: "Edit",
                    color: 'bg-wri-gold hover:bg-yellow-500',
                    icon: <PencilSquareIcon className='w-4 h-4 text-white' />,
                    tooltip: {
                      id: `edit-tooltip-${team.name}`,
                      content: "Edit Member role"
                    },
                    onClick: () => { }
                  },
                  {
                    label: "Delete", color: 'bg-red-600 hover:bg-red-500',
                    icon: <TrashIcon className='w-4 h-4 text-white' />,
                    tooltip: {
                      id: `delete-tooltip-${team.name}`,
                      content: "Remove member"
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
          <h3 className='w-full text-center my-auto'>Remove member: {UserProfile.title}</h3>
          <button
            className='w-full bg-red-500 text-white rounded-lg text-md py-2 flex justify-center items-center'
            onClick={() => {
              removeMember.mutate({ username: UserProfile.id, orgId: selectedTeam.name! });
            }}
          >
            {removeMember.isLoading ? <Spinner className='w-4 mr-4' /> : ''}
            {removeMember.isError ? 'Something went wrong. Try again' : 'I want to remove this Member'}
          </button>
        </Modal>
      )}
    </div>
  )
}




export default function UserCard() {
  const [query, setQuery] = useState<SearchInput>({ search: '', page: { start: 0, rows: 2 } })
  const { data, isLoading, refetch } = api.user.getAllUsers.useQuery(query)
  const [open, setOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const datasetUser = api.user.deleteUser.useMutation({
    onSuccess: async (data) => {
      await refetch();
      setOpen(false)
      notify(`User delete is successful`, 'success')
    },
  })

  const handleOpenModal = (user: IUser) => {
    setSelectedUser(user);
    setOpen(true);
  };

  return (
    <section className='w-full max-w-8xl flex flex-col gap-y-5 sm:gap-y-0'>
      <SearchHeader leftStyle='px-2 sm:pr-2 sm:pl-12' rightStyle='px-2 sm:pr-6' placeholder='Find a user' setQuery={setQuery} query={query} Pagination={<Pagination setQuery={setQuery} query={query} isLoading={isLoading} count={data?.count} />} />
      <div className='w-full'>
        {
          isLoading ? <div className='flex justify-center items-center h-screen'><Spinner className="mx-auto my-2" /></div> : (
            data?.users.map((user, index) => {
              return (
                <div key={user.id}>
                  <Row
                    key={user.id}
                    className={`pr-6`}
                    rowMain={<TeamProfile user={user as IUser} />}
                    linkButton={{
                      label: "View user",
                      link: "#",
                    }}
                    controlButtons={[
                      {
                        label: "Edit",
                        color: 'bg-wri-gold hover:bg-yellow-500',
                        icon: <PencilSquareIcon className='w-4 h-4 text-white' />,
                        tooltip: {
                          id: `edit-tooltip-${user.title}`,
                          content: "Edit user"
                        },
                        onClick: () => { }
                      },
                      {
                        label: "Delete", color: 'bg-red-600 hover:bg-red-500',
                        icon: <TrashIcon className='w-4 h-4 text-white' />,
                        tooltip: {
                          id: `delete-tooltip-${user.title}`,
                          content: "Delete user"
                        },
                        onClick: () => handleOpenModal(user)
                      },
                    ]}
                    rowSub={<SubCardProfile user={user} />}
                    isDropDown
                  />
                </div>
              )
            })
          )
        }
        {selectedUser && (
          <Modal open={open} setOpen={setOpen} className="max-w-[36rem] font-acumin flex flex-col gap-y-4" key={selectedUser.id}>
            <h3 className='w-full text-center my-auto'>Delete Dataset: {selectedUser.title}</h3>
            <button
              className=' w-full bg-red-500 text-white rounded-lg text-md py-2 flex justify-center items-center'
              id={selectedUser.title}
              onClick={() => {
                datasetUser.mutate(selectedUser.id)
              }}
            >{datasetUser.isLoading ? <Spinner className='w-4 mr-4' /> : ""}{" "}{datasetUser.isError ? "Something went wrong Try again" : "I want to delete this user"} </button>
          </Modal>)
        }
      </div>
    </section>
  )
}
