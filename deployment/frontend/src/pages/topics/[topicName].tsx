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
import { useRouter } from 'next/router'
import { GroupTree } from '@/schema/ckan.schema'
import DatasetTopic from '@/components/topics/DatasetTopic'
import { getServerAuthSession } from '@/server/auth'
import Spinner from '@/components/_shared/Spinner'
import GroupBreadcrumb from '@/components/team/GroupBreadcrumb'
import { getTopicTreeDetails } from '@/utils/apiUtils'
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import { appRouter } from '@/server/api/root'
import { createServerSideHelpers } from '@trpc/react-query/server'
import superjson from 'superjson'
import { env } from '@/env.mjs'

export async function getServerSideProps(
    context: GetServerSidePropsContext<{ topicName: string }>
) {
    const topicName = context.params?.topicName as string
    const query = {
        search: topicName,
        page: { start: 0, rows: 100 },
        tree: true,
    }
    const session = await getServerAuthSession(context)
    const helpers = createServerSideHelpers({
        router: appRouter,
        ctx: { session },
        transformer: superjson,
    })
    try {
        const topics = await getTopicTreeDetails({
            input: query,
            session: session,
        })

        if (topics.topics.length === 0) {
            throw new Error('Topic not found')
        }

        const topic = topics!.topics[0] as GroupTree
        const topicTitle = topic.title ?? topic.name

        await helpers.dataset.getAllDataset.prefetch({
            search: '',
            fq: {
                groups: topicName,
            },
            page: {
                start: 0,
                rows: 100,
            },
        })
        await helpers.topics.getTopic.prefetch({ id: topic.id })
        return {
            props: {
                trpcState: helpers.dehydrate(),
                topics,
                topicTitle,
                topicName,
            },
        }
    } catch {
        return {
            props: {},
            redirect: {
                destination: '/topics/404',
            },
        }
    }
}

export default function TopicPage(
    props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
    const router = useRouter()
    const { topics: data } = props

    const topicName = props.topicName as string
    const topicTitle = props.topicTitle as string

    const links = [
        {
            label: `Topics`,
            url: `/topics`,
            current: false,
        },
        {
            label: topicTitle,
            url: `/teams/${topicName}`,
            current: true,
        },
    ]

    return (
        <>
            <NextSeo
                title={`${topicTitle} - Topics`}
                description={`WRI Open Data Catalog Topic - ${topicTitle}`}
                openGraph={{
                    title: `${topicTitle} - Teams`,
                    description: `WRI Open Data Catalog Topic - ${topicTitle}`,
                    url: `${env.NEXT_PUBLIC_NEXTAUTH_URL}/topic/${topicName}`,
                }}
            />
            <Header />
            <Breadcrumbs links={links} />
            <Hero topics={data?.topics} topicsDetails={data?.topicDetails!} />
            <Subtopics
                topics={data?.topics}
                topicsDetails={data?.topicDetails!}
            />
            <div className="mx-auto grid w-full max-w-[1380px] gap-y-4 px-4 mt-20 font-acumin sm:px-6 xxl:px-0">
                <DatasetTopic topics={data?.topics!} key={router.asPath} />
            </div>

            <Footer />
        </>
    )
}
