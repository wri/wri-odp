import React from 'react'
import { Tab } from '@headlessui/react'
import { PlusSmallIcon, PlusCircleIcon } from '@heroicons/react/24/outline'
import DatasetLCardList from './DatasetLCardList'

const tabs = [
  {
    id: "datasets",
    content: (
      <DatasetLCardList />
    ),
    title: "All datasets",
  },
  {
    id: "nydatasets",
    content: (
      <div>activity</div>
    ),
    title: "My datasets",
  },
  {
    id: "favourites",
    content: (
      <div>activity</div>
    ),
    title: "My favourites",
  },
  {
    id: "drafts",
    content: (
      <div>activity</div>
    ),
    title: "Drafts",
  },
  {
    id: "approval",
    content: (
      <div>activity</div>
    ),
    title: "Awaiting Approval",
  },
  {
    id: "adddataset",
    content: (
      <div>activity</div>
    ),
    title: "Add dataset",
  }
]

export default function DatasetList() {
  return (
    <section id='teamtab' className='w-full max-w-8xl  font-acumin '>
      <Tab.Group>
        <Tab.List className="flex max-w-9xl  ">
          {tabs.map((tab) => (
            <Tab key={tab.title} className="  text-black font-normal text-base w-[50%]  accent-white">
              {({ selected }) => (
                <div
                  className={`font-normal  px-6 py-4 focus:outline-0  border-b-2  w-full  ${selected ? " border-b-wri-dark-green border-b-2 text-wri-green" : ""
                    } `}
                >
                  {tab.title === 'Add dataset' ? (
                    <div className='flex'>
                      <div className='flex  items-center justify-center w-4 h-4 rounded-full  bg-wri-gold mr-2 mt-[0.2rem]'>
                        <PlusSmallIcon className='w-3 h-3 text-white' />
                      </div>
                      <span>{tab.title}</span>
                    </div>
                  ) : (<span>{tab.title}</span>)
                  }

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
