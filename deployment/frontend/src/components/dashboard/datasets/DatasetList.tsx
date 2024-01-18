import React from 'react'
import { Tab } from '@headlessui/react'
import DatasetLCardList from './DatasetLCardList'
import Favourite from './Favourites'
import Drafts from './Drafts'
import ApprovalDataset from './ApprovalDataset'
import Mydataset from './Mydataset'
import DashboardDatasetTabs from './DashboardDatasetTabs'
import { useRouter } from 'next/router'

const tabs = [
    {
        id: 'datasets',
        name: 'All datasets',
        content: <DatasetLCardList />,
        title: 'All datasets',
    },
    {
        id: 'nydatasets',
        content: <Mydataset />,
        name: 'My datasets',
        title: 'My datasets',
    },
    {
        id: 'favourites',
        content: <Favourite />,
        name: 'My favourites',
        title: 'My favourites',
    },
    {
        id: 'drafts',
        content: <Drafts />,
        name: 'Drafts',
        title: 'Drafts',
    },
    {
        id: 'approval',
        content: <ApprovalDataset />,
        name: 'Awaiting Approval',
        title: 'Awaiting Approval',
    },
]

export default function DatasetList() {
    const router = useRouter()
    const { tab } = router.query
    return (
        <section id="teamtab" className="w-full max-w-8xl  font-acumin ">
            <Tab.Group defaultIndex={tab && tab === 'favorites' ? 2 : 0}>
                <Tab.List className="flex max-w-8xl  ">
                    <DashboardDatasetTabs tabs={tabs} />
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
