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
import type { GroupTree } from '@/schema/ckan.schema';
import notify from '@/utils/notify'
import Modal from '@/components/_shared/Modal';
import { useRouter } from 'next/router'
import { LoaderButton, Button } from '@/components/_shared/Button'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Dialog } from '@headlessui/react'


function TopicProfile({ team }: { team: GroupTree }) {
  const description = team?.children?.length ? `${team?.children?.length} subtopics` : 'No subtopics'
  const TopicProfile = team as IRowProfile
  TopicProfile.description = description
  return (
    <div className='flex py-5 pl-2' >
      <RowProfile imgStyle='w-16 h-16 bg-[#F9F9F9] group-hover:bg-white' isPad profile={team} defaultImg='/images/placeholders/topics/topicsdefault.png' />
    </div>
  )
}

function SubTopicProfile({ team }: { team: GroupTree }) {
  const description = team?.children?.length ? `${team?.children?.length} subtopics` : 'No subtopics'
  const TopicProfile = team as IRowProfile
  TopicProfile.description = description
  return (
    <div className='flex py-5 pl-3 sm:pl-5' >
      <RowProfile imgStyle='w-16 h-16 bg-[#F9F9F9] group-hover:bg-white' isPad profile={team} defaultImg='/images/placeholders/topics/topicsdefault.png' />
    </div>
  )
}

function SubCardProfile({ teams }: { teams: IRowProfile[] | GroupTree[] | undefined }) {
  const utils = api.useUtils()
  const [open, setOpen] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<GroupTree | null>(null)
  const router = useRouter()
  const deleteTopic = api.topics.deleteDashBoardTopic.useMutation({
    onSuccess: async (data) => {
      await utils.topics.getUsersTopics.invalidate({ search: '', page: { start: 0, rows: 10 } })
      setOpen(false)
      notify(`Successfully deleted the ${selectedTopic?.name} topic`, 'error')
    }
  })

  const handleOpenModal = (topic: GroupTree) => {
    setSelectedTopic(topic)
    setOpen(true)
  }

  if (!teams || teams.length === 0) return (<></>)
  return (
    <div className='flex flex-col pt-2 pl-4'>
      {
        teams.map((team, index) => {
          return (<>

            {
              (team as GroupTree).children?.length ?
                (
                  <>
                    <Row
                      key={index}
                      groupStyle="group/item group-hover/item:visible "
                      className={`pr-6 border-b-[1px] border-wri-gray hover:bg-[#DDEAEF]`}
                      rowMain={
                        <SubTopicProfile team={team as GroupTree} />
                      }
                      linkButton={{
                        label: "View topic",
                        link: "#",
                      }}
                      controlButtons={[
                        {
                          label: "Edit",
                          color: 'bg-wri-gold hover:bg-yellow-500',
                          icon: <PencilSquareIcon className='w-4 h-4 text-white' />,
                          tooltip: {
                            id: `edit-tooltip-${team.name}`,
                            content: "Edit topic"
                          },
                          onClick: () => {
                            router.push(`/dashboard/topics/${team.name}/edit`)
                          }
                        },
                        {
                          label: "Delete",
                          color: 'bg-red-600 hover:bg-red-500',
                          icon: <TrashIcon className='w-4 h-4 text-white' />,
                          tooltip: {
                            id: `delete-tooltip-${team.name}`,
                            content: "Delete topic"
                          },
                          onClick: () => handleOpenModal(team as GroupTree)
                        },
                      ]}
                      isDropDown
                      rowSub={<SubCardProfile teams={(team as GroupTree).children} />}
                    />
                  </>

                )
                : (
                  <>
                    <Row
                      key={index}
                      groupStyle="group/item group-hover/item:visible "
                      className={`pr-6 border-b-[1px] border-wri-gray hover:bg-[#DDEAEF]`}
                      rowMain={
                        <div className='flex pl-4 sm:pl-6  '>
                          <RowProfile imgStyle='w-8 h-8 mt-2' isPad profile={team as IRowProfile} defaultImg='/images/placeholders/topics/topicsdefault.png' />
                        </div>
                      }
                      linkButton={{
                        label: "View topic",
                        link: "#",
                      }}
                      controlButtons={[
                        {
                          label: "Edit",
                          color: 'bg-wri-gold hover:bg-yellow-500',
                          icon: <PencilSquareIcon className='w-4 h-4 text-white' />,
                          tooltip: {
                            id: `edit-tooltip-${team.name}`,
                            content: "Edit topic"
                          },
                          onClick: () => {
                            router.push(`/dashboard/topics/${team.name}/edit`)
                          }
                        },
                        {
                          label: "Delete",
                          color: 'bg-red-600 hover:bg-red-500',
                          icon: <TrashIcon className='w-4 h-4 text-white' />,
                          tooltip: {
                            id: `delete-tooltip-${team.name}`,
                            content: "Delete topic"
                          },
                          onClick: () => handleOpenModal(team as GroupTree)
                        },
                      ]}
                    />
                  </>

                )
            }
          </>)
        })
      }
      {
        selectedTopic && (
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
                  Delete Topic
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete this topic?
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 gap-x-4 sm:flex sm:flex-row-reverse">
              <LoaderButton
                variant="destructive"
                loading={deleteTopic.isLoading}
                onClick={() => deleteTopic.mutate(selectedTopic.id)}
              >
                Delete Topic
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




export default function TopicCard() {
  const [query, setQuery] = useState<SearchInput>({ search: '', page: { start: 0, rows: 10 } })
  const { data, isLoading, refetch } = api.topics.getUsersTopics.useQuery(query)
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const [selectedTopic, setSelectedTopic] = useState<GroupTree | null>(null)
  const deleteTopic = api.topics.deleteDashBoardTopic.useMutation({
    onSuccess: async (data) => {
      await refetch();
      setOpen(false)
      notify(`Successfully deleted the ${selectedTopic?.name} topic`, 'error')
    }
  })

  const handleOpenModal = (topic: GroupTree) => {
    setSelectedTopic(topic)
    setOpen(true)
  }



  return (
    <section className='w-full max-w-8xl flex flex-col gap-y-5 sm:gap-y-0'>
      <SearchHeader leftStyle=' sm:pr-2 sm:pl-12' rightStyle=' px-2 sm:pr-6' setQuery={setQuery} query={query} Pagination={<Pagination setQuery={setQuery} query={query} isLoading={isLoading} count={data?.count} />} />
      <div className='w-full'>
        {
          isLoading ? <div className='flex justify-center items-center h-screen'><Spinner className="mx-auto my-2" /></div> : (
            data?.topics.map((topic, index) => {
              return (
                <div key={topic.name}>
                  <Row
                    key={index}
                    className={`pr-6`}
                    rowMain={<TopicProfile team={topic} />}
                    linkButton={{
                      label: "View topic",
                      link: "#",
                    }}
                    controlButtons={[
                      {
                        label: "Edit",
                        color: 'bg-wri-gold hover:bg-yellow-400',
                        icon: <PencilSquareIcon className='w-4 h-4 text-white' />,
                        tooltip: {
                          id: `edit-tooltip-${topic.name}`,
                          content: "Edit topic"
                        },
                        onClick: () => {
                          router.push(`/dashboard/topics/${topic.name}/edit`)
                        }
                      },
                      {
                        label: "Delete",
                        color: 'bg-red-600 hover:bg-red-500',
                        icon: <TrashIcon className='w-4 h-4 text-white' />,
                        tooltip: {
                          id: `delete-tooltip-${topic.name}`,
                          content: "Delete topic"
                        },
                        onClick: () => handleOpenModal(topic)
                      },
                    ]}
                    rowSub={<SubCardProfile teams={topic.children} />}
                    isDropDown
                  />
                </div>

              )
            })
          )
        }

        {
          selectedTopic && (
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
                    Delete Topic
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this topic?
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 gap-x-4 sm:flex sm:flex-row-reverse">
                <LoaderButton
                  variant="destructive"
                  loading={deleteTopic.isLoading}
                  onClick={() => deleteTopic.mutate(selectedTopic.id)}
                >
                  Delete Topic
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
