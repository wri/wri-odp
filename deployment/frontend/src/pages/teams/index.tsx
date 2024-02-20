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
import { getServerAuthSession } from '@/server/auth'
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import { appRouter } from '@/server/api/root'
import { createServerSideHelpers } from '@trpc/react-query/server'
import superjson from 'superjson'
import { env } from '@/env.mjs'

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
    const [query, setQuery] = useState<SearchInput>({
        search: '',
        page: { start: 0, rows: 10000 },
        allTree: true,
    })
    const { data, isLoading } = api.teams.getGeneralTeam.useQuery(query)

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
                    images: [
                        {
                            url: `${env.NEXT_PUBLIC_NEXTAUTH_URL}/images/WRI_logo_4c.png`,
                            width: 800,
                            height: 600,
                            alt: 'Og Image Alt',
                        },
                    ],
                }}
                twitter={{
                    handle: '@WorldResources',
                    site: `${env.NEXT_PUBLIC_NEXTAUTH_URL}`,
                    cardType: 'summary_large_image',
                }}
            />
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
