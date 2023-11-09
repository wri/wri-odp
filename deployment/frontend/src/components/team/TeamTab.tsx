import React, { useState } from 'react'
import { Tab } from '@headlessui/react'
import DatasetList from './DatasetList'
import ActivityStreamList from '../_shared/ActivityStreamList'


const tabs = [
  {
    id: "datasets",
    content: (
      <DatasetList datasets={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]} />
    ),
    title: "Datasets",
  },
  {
    id: "activity",
    content: (
      <ActivityStreamList />
    ),
    title: "Activity stream",
  }
]

export default function TeamTab() {

  return (
    <section id='teamtab' className='w-full max-w-9xl xxl:mx-auto mt-10 font-acumin '>
      <Tab.Group>
        <Tab.List className="flex max-w-9xl">
          {tabs.map((tab) => (
            <Tab key={tab.title} className=" bg-wri-green text-white font-semibold text-[1.063rem] w-[50%] sm:w-[316px]">
              {({ selected }) => (
                <div
                  className={`font-semibold  px-6 py-4 focus:outline-0 w-full  ${selected ? " bg-wri-dark-green" : ""
                    } `}
                >
                  {tab.title}
                </div>
              )}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className='mt-2'>
          {tabs.map((tab) => (
            <Tab.Panel key={tab.title} className=''>
              {tab.content}
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </section>
  )
}
