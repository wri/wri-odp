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
import { Organization as CkanOrg } from '@portaljs/ckan'

const TeamsSearchResults = dynamic(
    () => import('@/components/team/TeamsSearchResults')
)

type Organization = CkanOrg & { numSubTeams: number }

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await getServerAuthSession(context)
    const helpers = createServerSideHelpers({
        router: appRouter,
        ctx: { session },
        transformer: superjson,
    })
    await Promise.all([
        await helpers.teams.getGeneralTeam.prefetch({
            search: '',
            page: { start: 0, rows: 10000 },
            allTree: true,
        }),
        await helpers.teams.list.prefetch(),
        await helpers.teams.getNumberOfSubTeams.prefetch(),
    ])

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
        page: { start: 0, rows: 100 },
        allTree: true,
    })
    const { data: allTeams } = api.teams.list.useQuery()
    const indexTeams = new Index({
        tokenize: 'full',
    })
    if (allTeams?.teams) {
        allTeams?.teams.forEach((team) => {
            indexTeams.add(
                team.id,
                JSON.stringify({
                    title: team.title,
                    description: team.description,
                })
            )
        })
    }

    function ProcessTeams() {
        if (!data || !allTeams) return { teams: [], teamsDetails: {}, count: 0 }
        const filteredTeams =
            query !== ''
                ? allTeams.teams.filter((t) =>
                      indexTeams.search(query).includes(t.id)
                  )
                : data.teams
        const teams = filteredTeams.slice(
            pagination.page.start,
            pagination.page.start + pagination.page.rows
        ) as GroupTree[] | Organization[]
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

            <section className=" px-8 xxl:px-0  max-w-8xl mx-auto flex flex-col font-acumin text-xl font-light leading-loose text-neutral-700 gap-y-6 mt-16">
                <div className="max-w-[705px] ml-2 2xl:ml-2">
                    <div className="default-home-container w-full border-t-[4px] border-stone-900" />
                    <h3 className="pt-1 font-acumin text-xl font-light leading-loose text-neutral-700 ">
                        This page lets you explore all the data associated with
                        a specific WRI project or team.
                        <br />
                        If you have questions about a project&apos;s data reach
                        out to the point of contact in the dataset or to{' '}
                        <a href="mailto:data@wri.org" className="text-blue-700">
                            {' '}
                            data@wri.org
                        </a>
                    </h3>
                </div>
            </section>

            {isLoading ? (
                <Spinner className="mx-auto" />
            ) : (
                <>
                    <TeamsSearchResults
                        filtered={
                            query !== '' &&
                            query !== null &&
                            typeof query !== 'undefined'
                        }
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
