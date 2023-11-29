import React, { useState } from 'react'
import DatasetHorizontalCard from '@/components/search/DatasetHorizontalCard'
import { api } from '@/utils/api'
import Spinner from '../_shared/Spinner'
import { GroupTree } from '@/schema/ckan.schema'
import Pagination from '@/components/datasets/Pagination'
import type { SearchInput } from '@/schema/search.schema'

export default function DatasetTeams({ teams }: { teams: GroupTree[] }) {
    teams = teams as GroupTree[]
    const team = teams[0] as GroupTree
    const teamName = team.name
    const topicTitle = team.title
    const [query, setQuery] = useState<SearchInput>({
        search: '',
        fq: {
            organization: teamName,
        },
        page: {
            start: 0,
            rows: 100,
        },
    })
    const { data, isLoading } = api.dataset.getAllDataset.useQuery(query)

    console.log('data: ', data?.datasets)
    return (
        <section>
            <div className="font-['Acumin Pro SemiCondensed'] text-2xl font-semibold text-black truncate whitespace-normal">
                Datasets associated with {topicTitle ?? teamName}{' '}
                {isLoading ? <Spinner /> : `(${data?.count})`}
            </div>
            {isLoading ? (
                <Spinner />
            ) : (
                <>
                    {data?.datasets.map((dataset, number) => (
                        <DatasetHorizontalCard dataset={dataset} key={number} />
                    ))}
                    <Pagination setQuery={setQuery} query={query} data={data} />
                </>
            )}
        </section>
    )
}
