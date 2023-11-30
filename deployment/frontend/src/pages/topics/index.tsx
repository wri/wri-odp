import Search from '@/components/Search'
import Header from '@/components/_shared/Header'
import Highlights from '@/components/Highlights'
import Recent from '@/components/Recent'
import Footer from '@/components/_shared/Footer'
import TopicsSearchResults from '@/components/topics/TopicsSearchResults'
import TopicsSearch from '@/components/topics/TopicsSearch'
import { NextSeo } from 'next-seo'
import { api } from '@/utils/api'
import { useState, useEffect } from 'react'
import Spinner from '@/components/_shared/Spinner'
import type { SearchInput } from '@/schema/search.schema'
import { useQuery } from 'react-query'
import { GroupTree, GroupsmDetails } from '@/schema/ckan.schema'
import Pagination from '@/components/datasets/Pagination'
import { getServerAuthSession } from '@/server/auth'
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import { appRouter } from '@/server/api/root'
import { createServerSideHelpers } from '@trpc/react-query/server'
import superjson from 'superjson'

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await getServerAuthSession(context)
    const helpers = createServerSideHelpers({
        router: appRouter,
        ctx: { session },
        transformer: superjson,
    })
    await helpers.topics.getGeneralTopics.prefetch({
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

export default function TopicsPage(
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
    const { data, isLoading, refetch } =
        api.topics.getGeneralTopics.useQuery(query)

    const ProcessedTopic = useQuery(
        ['topicspage', data, pagination],
        () => {
            if (!data) return { topics: [], topicDetails: {}, count: 0 }
            const topics = data?.topics.slice(
                pagination.page.start,
                pagination.page.start + pagination.page.rows
            )
            const topicDetails = data?.topicDetails
            return { topics, topicDetails, count: data?.count }
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
            <NextSeo title="Topics" />
            <Header />
            <TopicsSearch
                isLoading={isLoading}
                setQuery={setQuery}
                query={query}
            />
            {isLoading || ProcessedTopic.isLoading ? (
                <Spinner className="mx-auto" />
            ) : (
                <TopicsSearchResults
                    count={data?.count as number}
                    topics={ProcessedTopic?.data?.topics as GroupTree[]}
                    topicDetails={
                        ProcessedTopic?.data?.topicDetails as Record<
                            string,
                            GroupsmDetails
                        >
                    }
                />
            )}

            {isLoading || ProcessedTopic.isLoading ? (
                <Spinner className="mx-auto" />
            ) : (
                <div className="w-full px-8 xxl:px-0 max-w-8xl mx-auto">
                    <Pagination
                        setQuery={setPagination}
                        query={pagination}
                        data={data}
                    />
                </div>
            )}

            <Footer
                links={{
                    primary: { title: 'Advanced Search', href: '#' },
                    secondary: { title: 'Explore Teams', href: '#' },
                }}
            />
        </>
    )
}
