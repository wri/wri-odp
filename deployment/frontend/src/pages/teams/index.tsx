import Header from '@/components/_shared/Header'
import Footer from '@/components/_shared/Footer'
import TeamsSearch from '@/components/team/TeamsSearch'
// import TeamsSearchResults from '@/components/team/TeamsSearchResults'
import { NextSeo } from 'next-seo'
import { api } from '@/utils/api'
import { useState, useEffect } from 'react'
import Spinner from '@/components/_shared/Spinner'
import type { SearchInput } from '@/schema/search.schema'
import { useQuery } from 'react-query'
import Pagination from '@/components/datasets/Pagination'
import { GroupTree, GroupsmDetails } from '@/schema/ckan.schema'
import { getServerAuthSession } from '@/server/auth'
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import { appRouter } from '@/server/api/root'
import { createServerSideHelpers } from '@trpc/react-query/server'
import superjson from 'superjson'
import { env } from '@/env.mjs'
import dynamic from 'next/dynamic'
import { Index } from 'flexsearch'

const TeamsSearchResults = dynamic(
    () => import('@/components/team/TeamsSearchResults')
)

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await getServerAuthSession(context)
    const helpers = createServerSideHelpers({
        router: appRouter,
        ctx: { session },
        transformer: superjson,
    })
    await helpers.teams.getGeneralTeam.prefetch({
        search: '',
        page: { start: 0, rows: 10000 },
        allTree: true,
    })

    return {
        props: {
            trpcState: helpers.dehydrate(),
        },
    }
}

export default function TeamsPage(
    props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
    const [pagination, setPagination] = useState<SearchInput>({
        search: '',
        page: { start: 0, rows: 10 },
    })

    const [query, setQuery] = useState<string>('')

    const { data, isLoading } = api.teams.getGeneralTeam.useQuery({
        search: '',
        page: { start: 0, rows: 1000 },
        allTree: true,
    })
    const indexTeams = new Index({
        tokenize: 'full',
    })
    if (data?.teams) {
        data?.teams.forEach((team) => {
            indexTeams.add(team.id, JSON.stringify(team))
        })
    }

    function ProcessTeams() {
        if (!data) return { teams: [], teamsDetails: {}, count: 0 }
        const filteredTeams =
            query !== ''
                ? data.teams.filter((t) =>
                      indexTeams.search(query).includes(t.id)
                  )
                : data.teams
        const teams = filteredTeams.slice(
            pagination.page.start,
            pagination.page.start + pagination.page.rows
        )
        const teamsDetails = data?.teamsDetails
        return { teams, teamsDetails, count: filteredTeams.length }
    }

    const filteredTeams = ProcessTeams()

    return (
        <>
            <NextSeo
                title="Teams"
                description="WRI Open Data Catalog Teams"
                openGraph={{
                    title: 'Teams',
                    description: 'WRI Open Data Catalog Teams',
                    url: `${env.NEXT_PUBLIC_NEXTAUTH_URL}/teams`,
                    type: 'website',
                }}
            />
            <Header />
            <TeamsSearch
                isLoading={isLoading}
                setQuery={setQuery}
                query={query}
            />

            {isLoading ? (
                <Spinner className="mx-auto" />
            ) : (
                <>
                    <TeamsSearchResults
                        count={filteredTeams.count}
                        teams={filteredTeams?.teams}
                        teamsDetails={filteredTeams?.teamsDetails}
                    />
                    <div className="w-full px-8 xxl:px-0 max-w-8xl mx-auto">
                        <Pagination
                            setQuery={setPagination}
                            query={pagination}
                            data={filteredTeams}
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
