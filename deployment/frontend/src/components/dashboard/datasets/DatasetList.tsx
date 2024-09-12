import React from 'react'
import { Tab } from '@headlessui/react'
import DatasetLCardList from './DatasetLCardList'
import Favourite from './Favourites'
import Drafts from './Drafts'
import ApprovalDataset from './ApprovalDataset'
import Mydataset from './Mydataset'
import DashboardDatasetTabs from './DashboardDatasetTabs'
import { useRouter } from 'next/router'
import type { SearchInput } from '@/schema/search.schema'
import { useState, useEffect } from 'react'

const tabs = [
    {
        id: 'datasets',
        name: 'All datasets',
        content: DatasetLCardList,
        title: 'All datasets',
    },
    {
        id: 'mydatasets',
        content: Mydataset,
        name: 'My datasets',
        title: 'My datasets',
    },
    {
        id: 'favourites',
        content: Favourite,
        name: 'My favourites',
        title: 'My favourites',
    },
    {
        id: 'drafts',
        content: Drafts,
        name: 'Drafts',
        title: 'Drafts',
    },
    {
        id: 'approval',
        content: ApprovalDataset,
        name: 'Awaiting Approval',
        title: 'Awaiting Approval',
    },
]

export default function DatasetList() {
    const router = useRouter()
    const { tab } = router.query
    const tabIndex = tab ? tabs.findIndex((i) => i.id === tab) : 0
    const q = router.query
    const [query, setQuery] = useState<SearchInput>({
        search: q.search ? JSON.parse(q.search as string) : '',
        page: q.page ? JSON.parse(q.page as string) : { start: 0, rows: 10 },
        fq: q.fq ? JSON.parse(q.fq as string) : {},
        _isUserSearch: true,
        tab: tab ? (tab as string) : 'datasets',
    })

    useEffect(() => {
        router.push(
            {
                pathname: router.pathname,
                query: {
                    search: JSON.stringify(query.search),
                    page: JSON.stringify(query.page),
                    fq: JSON.stringify(query.fq),
                    tab: query.tab,
                },
            },
            undefined,
            {
                shallow: true,
            }
        )
    }, [query.search, query.page, query.fq, query.tab])

    return (
        <section id="teamtab" className="w-full max-w-8xl  font-acumin ">
            <Tab.Group
                defaultIndex={tabIndex}
                onChange={(index) => {
                    setQuery({
                        ...query,
                        search: '',
                        page: { start: 0, rows: 10 },
                        fq: {},
                        tab: (tabs[index] as { id: string }).id,
                    })
                }}
            >
                <Tab.List className="flex max-w-8xl  ">
                    <DashboardDatasetTabs tabs={tabs} />
                </Tab.List>
                <Tab.Panels className="mt-2">
                    {tabs.map((tab, i) => (
                        <Tab.Panel key={tab.title} className="">
                            <tab.content
                                setQuery={setQuery}
                                query={query}
                                key={tab.title}
                            />
                        </Tab.Panel>
                    ))}
                </Tab.Panels>
            </Tab.Group>
        </section>
    )
}
