import React from 'react'
import { Tab } from '@headlessui/react'
import { PlusSmallIcon, PlusCircleIcon } from '@heroicons/react/24/outline'
import TeamCard from './TeamCard'
import Link from 'next/link'

const tabs = [
    {
        id: 'allteams',
        content: <TeamCard />,
        title: 'All teams',
    },
]

export default function TeamList() {
    return (
        <section id="teamtab" className="w-full max-w-8xl  font-acumin ">
            <Tab.Group>
                <Tab.List className="flex max-w-9xl  border-b-2 border-b-wri-gray ">
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
                                    <span>{tab.title}</span>
                                </div>
                            )}
                        </Tab>
                    ))}
                    <Link
                        href="/dashboard/teams/new"
                        className="font-normal  px-6 py-4 focus:outline-0  w-full"
                    >
                        <div className="flex">
                            <div className="flex  items-center justify-center w-4 h-4 rounded-full  bg-wri-gold mr-2 mt-[0.2rem]">
                                <PlusSmallIcon className="w-3 h-3 text-white" />
                            </div>
                            <span>Add team</span>
                        </div>
                    </Link>
                </Tab.List>
                <Tab.Panels className="mt-2">
                    {tabs.map((tab) => (
                        <Tab.Panel key={tab.title} className="">
                            {tab.content}
                        </Tab.Panel>
                    ))}
                </Tab.Panels>
            </Tab.Group>
        </section>
    )
}
