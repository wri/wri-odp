import Header from '@/components/_shared/Header'
import Footer from '@/components/_shared/Footer'
import { Breadcrumbs } from '@/components/_shared/Breadcrumbs'
import DatasetHorizontalCard from '@/components/search/DatasetHorizontalCard'
import { Hero } from '@/components/topics/Hero'
import Pagination from '@/components/_shared/Pagination'
import Subtopics from '@/components/topics/Subtopics'
import { useState } from 'react'
import { SearchInput } from '@/schema/search.schema'
import { api } from '@/utils/api'
import { NextSeo } from 'next-seo'

const links = [
    { label: 'Topics', url: '/topics', current: false },
    { label: 'Topics 1', url: '/topics/test', current: true },
]

export default function TopicPage() {
    const [query, setQuery] = useState<SearchInput>({
        search: '',
        page: { start: 0, rows: 0 },
        fq: {},
    })

    const { data, isLoading } = api.dataset.getAllDataset.useQuery(query)

    const topic = { title: 'Team Title', name: 'Team Name' }
    return (
        <>
            <NextSeo title={`${topic?.title ?? topic?.name} - Topics`} />
            <Header />
            <Breadcrumbs links={links} />
            <Hero />
            <Subtopics />
            <div className="mx-auto grid w-full max-w-[1380px] gap-y-4 px-4 mt-20 font-acumin sm:px-6 xxl:px-0">
                <div className="font-['Acumin Pro SemiCondensed'] text-2xl font-semibold text-black truncate whitespace-normal">
                    Datasets associated with Topic 1 (784)
                </div>
                {data?.datasets.map((dataset, number) => (
                    <DatasetHorizontalCard dataset={dataset} key={number} />
                ))}
                <Pagination />
            </div>
            <Footer />
        </>
    )
}
