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
import { LoaderButton, Button } from '@/components/_shared/Button'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Dialog } from '@headlessui/react'
import { useQuery } from 'react-query';


type IUser = {
  title?: string;
  id: string;
  description?: string;
  email_hash?: string;
  orgnumber?: number;
  image_display_url?: string;
  orgs?:
  {
    title?: string;
    capacity?: string;
    image_display_url?: string;
    name?: string;
    userCapacity?: string;
  }[]
}


function TeamProfile({ user }: { user: IRowProfile | IUser }) {

  const UserProfile = user as IUser
  user.image_display_url = (user?.image_display_url as string) ? user?.image_display_url : `https://gravatar.com/avatar/${(user as IUser)?.email_hash}?s=270&d=identicon`
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
      await utils.user.getAllUsers.invalidate({ search: '', page: { start: 0, rows: 100 } })
      setOpen(false)
      notify(`Successfully deleted user from ${selectedTeam?.name} team`, 'error')
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
                authorized={team.userCapacity?.toLowerCase() === 'admin' ? true : false}
                key={index}
                groupStyle="group/item group-hover/item:visible "
                className={`pr-6 border-b-[1px] border-wri-gray hover:bg-[#DDEAEF] `}
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
                  Delete Member
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete this member?
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 gap-x-4 sm:flex sm:flex-row-reverse">
              <LoaderButton
                variant="destructive"
                loading={removeMember.isLoading}
                onClick={() => removeMember.mutate({ username: UserProfile.id, orgId: selectedTeam.name! })}
              >
                Delete Member
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
  )
}




export default function UserCard() {
  const [query, setQuery] = useState<SearchInput>({ search: '', page: { start: 0, rows: 10 } })
  const { data, isLoading, refetch } = api.user.getAllUsers.useQuery({ search: '', page: { start: 0, rows: 100 } })
  const [open, setOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const datasetUser = api.user.deleteUser.useMutation({
    onSuccess: async (data) => {
      await refetch();
      setOpen(false)
      notify(`Successfully deleted the ${selectedUser?.title} user`, 'error')
    },
  })

  const processedData = useQuery(['processedUser', data, query], () => {
    if (!data) return { users: [], count: 0 };
    const searchTerm = query.search.toLowerCase();
    const users = data.users;
    let filteredData = users;
    if (searchTerm) {
      filteredData = users
        .filter(user => user.title?.toLowerCase().includes(searchTerm))
        .sort((a, b) => {
          const titleA = a.title?.toLowerCase() || '';
          const titleB = b.title?.toLowerCase() || '';

          return titleA.localeCompare(titleB);
        });
    }
    const start = query.page.start;
    const rows = query.page.rows;
    const slicedData = filteredData.slice(start, start + rows);
    return { users: slicedData, count: filteredData.length };
  }, {
    enabled: !!data, // Only run the query when data is available
  });


  const handleOpenModal = (user: IUser) => {
    setSelectedUser(user);
    setOpen(true);
  };


  return (
    <section className='w-full max-w-8xl flex flex-col gap-y-5 sm:gap-y-0'>
      <SearchHeader leftStyle='px-2 sm:pr-2 sm:pl-12' rightStyle='px-2 sm:pr-6' placeholder='Find a user' setQuery={setQuery} query={query}
        Pagination={<Pagination setQuery={setQuery} query={query} isLoading={processedData.isLoading} count={processedData.data?.count} />} />
      <div className='w-full'>
        {
          isLoading || processedData.isLoading ? <div className='flex justify-center items-center h-screen'><Spinner className="mx-auto my-2" /></div> : (
            processedData.data?.users.map((user, index) => {
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

        {
          selectedUser && (
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
                    Delete User
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this user?
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 gap-x-4 sm:flex sm:flex-row-reverse">
                <LoaderButton
                  variant="destructive"
                  loading={datasetUser.isLoading}
                  onClick={() => datasetUser.mutate(selectedUser.id)}
                  id={selectedUser.title}
                >
                  Delete User
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
