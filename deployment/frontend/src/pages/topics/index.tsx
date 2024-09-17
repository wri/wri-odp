import Header from '@/components/_shared/Header'
import Footer from '@/components/_shared/Footer'
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
import { env } from '@/env.mjs'
import dynamic from 'next/dynamic'
import { Index } from 'flexsearch'
const TopicsSearchResults = dynamic(
    () => import('@/components/topics/TopicsSearchResults')
)

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await getServerAuthSession(context)
    const helpers = createServerSideHelpers({
        router: appRouter,
        ctx: { session },
        transformer: superjson,
    })
    await Promise.all([
        await helpers.topics.getGeneralTopics.prefetch({
            search: '',
            page: { start: 0, rows: 10000 },
            allTree: true,
        }),
        await helpers.topics.list.prefetch(),
        await helpers.topics.getNumberOfSubtopics.prefetch(),
    ])

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
    const [query, setQuery] = useState<string>('')
    const { data, isLoading } = api.topics.getGeneralTopics.useQuery({
        search: '',
        page: { start: 0, rows: 1000 },
        allTree: true,
    })
    const { data: allTopics } = api.topics.list.useQuery()

    const indexTopics = new Index({
        tokenize: 'full',
    })
    if (allTopics?.topics) {
        allTopics?.topics.forEach((topic) => {
            indexTopics.add(
                topic.id,
                JSON.stringify({
                    title: topic.title,
                    description: topic.description,
                })
            )
        })
    }

    function ProcessTopics() {
        if (!data || !allTopics)
            return { topics: [], topicDetails: {}, count: 0 }
        const filteredTopics =
            query !== ''
                ? allTopics.topics.filter((t) =>
                      indexTopics.search(query).includes(t.id)
                  )
                : data.topics
        const topics = filteredTopics.slice(
            pagination.page.start,
            pagination.page.start + pagination.page.rows
        )
        const topicDetails = data.topicDetails
        return { topics, topicDetails, count: filteredTopics.length }
    }

    const filteredTopics = ProcessTopics()

    return (
        <>
            <NextSeo
                title="Topics"
                description="WRI Open Data Catalog Topics"
                openGraph={{
                    title: 'Topics',
                    description: 'WRI Open Data Catalog Topics',
                    url: `${env.NEXT_PUBLIC_NEXTAUTH_URL}/topics`,
                    type: 'website',
                }}
            />
            <Header />
            <TopicsSearch
                isLoading={isLoading}
                setQuery={setQuery}
                query={query}
            />
            <section className=" px-8 xxl:px-0  max-w-8xl mx-auto flex flex-col font-acumin text-xl font-light leading-loose text-neutral-700 gap-y-6 mt-16">
                <div className="max-w-[705px] ml-2 2xl:ml-2">
                    <div className="default-home-container w-full border-t-[4px] border-stone-900" />
                    <h3 className="pt-1 font-acumin text-xl font-light leading-loose text-neutral-700 ">
                        Explore reliable datasets filtered by the topic of your
                        interest.
                    </h3>
                </div>
            </section>
            {isLoading ? (
                <Spinner className="mx-auto" />
            ) : (
                <>
                    <TopicsSearchResults
                        filtered={
                            query !== '' &&
                            query !== null &&
                            typeof query !== 'undefined'
                        }
                        count={filteredTopics.count}
                        topics={filteredTopics.topics}
                        topicDetails={filteredTopics.topicDetails}
                    />
                    <div className="w-full px-8 xxl:px-0 max-w-8xl mx-auto">
                        <Pagination
                            setQuery={setPagination}
                            query={pagination}
                            data={filteredTopics}
                        />
                    </div>
                </>
            )}
            <Footer
                links={{
                    primary: { title: 'Advanced Search', href: '#' },
                    secondary: { title: 'Explore Topics', href: '#' },
                }}
            />
        </>
    )
}
