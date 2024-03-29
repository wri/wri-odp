import React from 'react'
import { Tab } from '@headlessui/react'
import { PlusSmallIcon, PlusCircleIcon } from '@heroicons/react/24/outline'
import UserCard from './UserCard'
import { useRouter } from 'next/router'
import AddUserForm from './AddUserForm'
import { api } from '@/utils/api'
import Spinner from '@/components/_shared/Spinner'

export function empty({ username }: { username: string }) {
    return <div></div>
}
const tabs = [
    {
        id: 'allteams',
        content: UserCard,
        title: 'All users',
    },
    {
        id: 'addteam',
        content: AddUserForm,
        title: 'Add user',
    },
]

export default function UserList() {
    const { q } = useRouter().query
    const username = (q as string) ?? ''
    const { data, isLoading } = api.user.getUserCapacity.useQuery()

    return (
        <section id="teamtab" className="w-full max-w-8xl  font-acumin ">
            <Tab.Group>
                <Tab.List className="flex max-w-9xl outline-1 border-b-2 border-b-wri-gray ">
                    {tabs.map((tab) => (
                        <Tab
                            key={tab.title}
                            className="  text-black font-normal text-base w-[50%] sm:w-[20%]  accent-white"
                        >
                            {({ selected }) => (
                                <div
                                    className={`font-normal  px-6 py-4 focus:outline-0  w-full  ${
                                        selected
                                            ? ' border-b-wri-dark-green border-b-2 text-wri-green'
                                            : ''
                                    } `}
                                >
                                    {tab.title === 'Add user' ? (
                                        isLoading ? (
                                            <Spinner />
                                        ) : data?.isOrgAdmin ? (
                                            <div className="flex">
                                                <div className="flex  items-center justify-center w-4 h-4 rounded-full  bg-wri-gold mr-2 mt-[0.2rem]">
                                                    <PlusSmallIcon className="w-3 h-3 text-white" />
                                                </div>
                                                <span>{tab.title}</span>
                                            </div>
                                        ) : null
                                    ) : (
                                        <span>{tab.title}</span>
                                    )}
                                </div>
                            )}
                        </Tab>
                    ))}
                </Tab.List>
                <Tab.Panels className="mt-2">
                    {tabs.map((tab) => (
                        <Tab.Panel key={tab.title} className="">
                            {tab.id === 'allteams' ? (
                                <UserCard username={username} />
                            ) : isLoading ? (
                                <Spinner />
                            ) : (
                                <AddUserForm orgList={data?.adminOrg!} />
                            )}
                        </Tab.Panel>
                    ))}
                </Tab.Panels>
            </Tab.Group>
        </section>
    )
}
