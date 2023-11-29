import Header from '@/components/_shared/Header'
import Footer from '@/components/_shared/Footer'
import TeamsSearch from '@/components/team/TeamsSearch'
import TeamsSearchResults from '@/components/team/TeamsSearchResults'
import { NextSeo } from 'next-seo'
import { api } from '@/utils/api'
import { useState, useEffect } from 'react'
import Spinner from '@/components/_shared/Spinner'
import type { SearchInput } from '@/schema/search.schema'
import { useQuery } from 'react-query'
import Pagination from '@/components/datasets/Pagination'
import { GroupTree, GroupsmDetails } from '@/schema/ckan.schema'

export default function TeamsPage() {
    const [pagination, setPagination] = useState<SearchInput>({
        search: '',
        page: { start: 0, rows: 10 },
    })
    const [query, setQuery] = useState<SearchInput>({
        search: '',
        page: { start: 0, rows: 10000 },
    })
    const { data, isLoading, refetch } =
        api.teams.getGeneralTeam.useQuery(query)

    const ProcessedTeam = useQuery(
        ['teamspage', data, pagination],
        () => {
            if (!data) return { teams: [], teamsDetails: {}, count: 0 }
            const teams = data?.teams.slice(
                pagination.page.start,
                pagination.page.start + pagination.page.rows
            )
            const teamsDetails = data?.teamsDetails
            return { teams, teamsDetails, count: data?.count }
        },
        {
            enabled: !!data,
        }
    )

    useEffect(() => {
        setPagination({ search: '', page: { start: 0, rows: 10 } })
    }, [query.search])

    console.log('teamDetails', data?.teamsDetails)
    return (
        <>
            <NextSeo title="Teams" />
            <Header />
            <TeamsSearch
                isLoading={isLoading}
                setQuery={setQuery}
                query={query}
            />

            {isLoading || ProcessedTeam.isLoading ? (
                <Spinner className="mx-auto" />
            ) : (
                <>
                    <TeamsSearchResults
                        count={data?.count as number}
                        teams={ProcessedTeam?.data?.teams as GroupTree[]}
                        teamsDetails={
                            ProcessedTeam?.data?.teamsDetails as Record<
                                string,
                                GroupsmDetails
                            >
                        }
                    />
                    <div className="w-full px-8 xxl:px-0 max-w-8xl mx-auto">
                        <Pagination
                            setQuery={setPagination}
                            query={pagination}
                            data={data}
                        />
                    </div>
                </>
            )}

            <Footer
                links={{
                    primary: { title: 'Advanced Search', href: '/search' },
                    secondary: { title: 'Explore Topics', href: '/topics' },
                }}
            />
        </>
    )
}
