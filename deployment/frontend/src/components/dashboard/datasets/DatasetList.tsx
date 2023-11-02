import React from 'react'
import { Tab } from '@headlessui/react'
import { PlusSmallIcon, PlusCircleIcon } from '@heroicons/react/24/outline'
import DatasetLCardList from './DatasetLCardList'
import Favourite from './Favourites'
import Drafts from './Drafts'
import ApprovalDataset from './ApprovalDataset'
import Mydataset from './Mydataset'
import DatasetTabs from './DatasetTabs'

const tabs = [
  {
    id: "datasets",
    name: "All datasets",
    content: (
      <DatasetLCardList />
    ),
    title: "All datasets",
  },
  {
    id: "nydatasets",
    content: (
      <Mydataset />
    ),
    name: "My datasets",
    title: "My datasets",
  },
  {
    id: "favourites",
    content: (
      <Favourite />
    ),
    name: "My favourites",
    title: "My favourites",
  },
  {
    id: "drafts",
    content: (
      <Drafts />
    ),
    name: "Drafts",
    title: "Drafts",
  },
  {
    id: "approval",
    content: (
      <ApprovalDataset />
    ),
    name: "Awaiting Approval",
    title: "Awaiting Approval",
  },
  {
    id: "adddataset",
    content: (
      <div>activity</div>
    ),
    name: "Add dataset",
    title: "Add dataset",
  }
]

export default function DatasetList() {
  return (
    <section id='teamtab' className='w-full max-w-8xl  font-acumin '>
      <Tab.Group>
        <Tab.List className="flex max-w-8xl  ">
          <DatasetTabs tabs={tabs} />
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