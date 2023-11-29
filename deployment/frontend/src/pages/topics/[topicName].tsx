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

export default function TopicPage() {
    const router = useRouter()
    const { topicName } = router.query
    const { data, isLoading: topicIsLoading } =
        api.topics.getGeneralTopics.useQuery({
            search: topicName as string,
            page: { start: 0, rows: 100 },
            tree: true,
        })

    return (
        <>
            <NextSeo
                title={`${topicName as string}
                } - Topics`}
            />
            <Header />
            <GroupBreadcrumb
                groups={data?.topics!}
                groupType="topics"
                isLoading={topicIsLoading}
            />
            {topicIsLoading ? (
                <Spinner className="mx-auto" />
            ) : (
                <>
                    <Hero
                        topics={data?.topics}
                        topicsDetails={data?.topicDetails!}
                    />
                    <Subtopics
                        topics={data?.topics}
                        topicsDetails={data?.topicDetails!}
                    />
                    <div className="mx-auto grid w-full max-w-[1380px] gap-y-4 px-4 mt-20 font-acumin sm:px-6 xxl:px-0">
                        <DatasetTopic topics={data?.topics!} />
                    </div>
                </>
            )}
            <Footer />
        </>
    )
}
