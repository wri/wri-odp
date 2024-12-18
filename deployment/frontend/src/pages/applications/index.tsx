import Header from '@/components/_shared/Header'
import Footer from '@/components/_shared/Footer'
import ApplicationSearch from '@/components/applications/ApplicationSearch'
import { NextSeo } from 'next-seo'
import { api } from '@/utils/api'
import { useState } from 'react'
import Spinner from '@/components/_shared/Spinner'
import type { SearchInput } from '@/schema/search.schema'
import Pagination from '@/components/datasets/Pagination'
import { getServerAuthSession } from '@/server/auth'
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import { appRouter } from '@/server/api/root'
import { createServerSideHelpers } from '@trpc/react-query/server'
import superjson from 'superjson'
import { env } from '@/env.mjs'
import dynamic from 'next/dynamic'
import { Index } from 'flexsearch'
import { Breadcrumbs } from '@/components/_shared/Breadcrumbsv2'

const ApplicationSearchResult = dynamic(
    () => import('@/components/applications/ApplicationSearchResults')
)

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await getServerAuthSession(context)
    const helpers = createServerSideHelpers({
        router: appRouter,
        ctx: { session },
        transformer: superjson,
    })
    await Promise.all([await helpers.applications.getAllApplications.prefetch()])

    return {
        props: {
            trpcState: helpers.dehydrate(),
        },
    }
}

export default function ApplicationsPage(
    props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
    const [pagination, setPagination] = useState<SearchInput>({
        search: '',
        page: { start: 0, rows: 10 },
    })
    const [query, setQuery] = useState<string>('')
    const { data: applications, isLoading } =
        api.applications.getAllApplications.useQuery()

    const indexApplications = new Index({
        tokenize: 'full',
    })
    if (applications) {
        applications.forEach((application) => {
            indexApplications.add(
                application.id,
                JSON.stringify({
                    title: application.title,
                    description: application.description,
                })
            )
        })
    }

    function ProcessApplications() {
        if (!applications) return { applications: [], count: 0 }
        const filteredApplications =
            query !== ''
                ? applications.filter((t) =>
                      indexApplications.search(query).includes(t.id)
                  )
                : applications
        const _applications = filteredApplications.slice(
            pagination.page.start,
            pagination.page.start + pagination.page.rows
        )
        return {
            applications: _applications,
            count: filteredApplications.length,
        }
    }

    const filteredApplications = ProcessApplications()
    const maxStart = Math.max(
        0,
        filteredApplications.count - pagination.page.rows
    )
    if (pagination.page.start > maxStart) {
        setPagination((prev) => ({
            ...prev,
            page: { ...prev.page, start: maxStart },
        }))
    }

    const links = [{ label: 'Applications', url: '/applications', current: true }]
    return (
        <>
            <NextSeo
                title="Applications"
                description="WRI Open Data Catalog Applications"
                openGraph={{
                    title: 'Applications',
                    description: 'WRI Open Data Catalog Applications',
                    url: `${env.NEXT_PUBLIC_NEXTAUTH_URL}/applications`,
                    type: 'website',
                }}
            />
            <Header />
            <Breadcrumbs links={links} />
            <ApplicationSearch
                isLoading={isLoading}
                setQuery={setQuery}
                query={query}
            />
            {isLoading ? (
                <Spinner className="mx-auto" />
            ) : (
                <>
                    <ApplicationSearchResult
                        filtered={
                            query !== '' &&
                            query !== null &&
                            typeof query !== 'undefined'
                        }
                        count={filteredApplications.count}
                        applications={filteredApplications.applications}
                    />
                    <div className="w-full px-8 xxl:px-0 max-w-8xl mx-auto">
                        <Pagination
                            setQuery={setPagination}
                            query={pagination}
                            data={filteredApplications}
                        />
                    </div>
                </>
            )}
            <Footer
                links={{
                    primary: { title: 'Explore Topics', href: '/topics' },
                    secondary: { title: 'Explore Teams', href: '/teams' },
                }}
            />
        </>
    )
}
