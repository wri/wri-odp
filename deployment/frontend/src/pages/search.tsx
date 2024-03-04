import Header from '@/components/_shared/Header'
import Highlights from '@/components/Highlights'
import Recent from '@/components/Recent'
import Footer from '@/components/_shared/Footer'
import { api } from '@/utils/api'
import Spinner from '@/components/_shared/Spinner'
import { ErrorAlert } from '@/components/_shared/Alerts'
import RedirectedSearchInput from '@/components/search/RedirectedSearchInput'
import { NextSeo } from 'next-seo'
import { env } from '@/env.mjs'
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import superjson from 'superjson'
import { createServerSideHelpers } from '@trpc/react-query/server'
import { appRouter } from '@/server/api/root'
import { getServerAuthSession } from '@/server/auth'

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await getServerAuthSession(context)
    const helpers = createServerSideHelpers({
        router: appRouter,
        ctx: { session },
        transformer: superjson,
    })

    await helpers.dataset.getAllDataset.prefetch({
        search: '',
        page: { rows: 8, start: 0 },
        sortBy: 'metadata_created desc',
    })

    await helpers.dataset.getAllDataset.prefetch({
        search: '',
        page: { rows: 8, start: 0 },
        sortBy: 'metadata_modified desc',
    })

    await helpers.dataset.getFeaturedDatasets.prefetch({
        search: '',
        page: { start: 0, rows: 100 },
        sortBy: 'metadata_modified desc',
        _isUserSearch: false,
    })


    return {
        props: {
             trpcState: helpers.dehydrate(),
        },
    }
}

export default function SearchPage( props: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const {
        data: recentlyAdded,
        isLoading: isLoadingRecentlyAdded,
        error: errorRecentlyAdded,
    } = api.dataset.getAllDataset.useQuery({
        search: '',
        page: { rows: 8, start: 0 },
        sortBy: 'metadata_created desc',
    })

    const {
        data: recentlyUpdated,
        isLoading: isLoadingRecentlyUpdated,
        error: errorRecentlyUpdated,
    } = api.dataset.getAllDataset.useQuery({
        search: '',
        page: { rows: 8, start: 0 },
        sortBy: 'metadata_modified desc',
    })

    return (
        <>
            <NextSeo
                title="Explore Data"
                description={`Explore WRI Open Data Catalog`}
                openGraph={{
                    title: `Explore Data`,
                    description: `Explore WRI Open Data Catalog`,
                    url: `${env.NEXT_PUBLIC_NEXTAUTH_URL}/search`,
                }}
            />
            <Header />
            <RedirectedSearchInput />
            <Highlights />
            {isLoadingRecentlyAdded ? (
                <div className="w-full flex justify-center items-center h-10">
                    <Spinner />
                </div>
            ) : errorRecentlyAdded ? (
                <ErrorAlert
                    title="Failed to load recently added datasets"
                    text={errorRecentlyAdded.message}
                />
            ) : (
                <Recent
                    datasets={recentlyAdded.datasets}
                    title="Recently added"
                />
            )}
            {isLoadingRecentlyUpdated ? (
                <div className="w-full flex justify-center items-center h-10">
                    <Spinner />
                </div>
            ) : errorRecentlyUpdated ? (
                <ErrorAlert
                    title="Failed to load recently updated datasets"
                    text={errorRecentlyUpdated.message}
                />
            ) : (
                <Recent
                    datasets={recentlyUpdated.datasets}
                    title="Recently updated"
                />
            )}
            <Footer
                links={{
                    primary: { title: 'Explore Topics', href: '/topics' },
                    secondary: {
                        title: 'Advanced Search',
                        href: '/search_advanced',
                    },
                }}
            />
        </>
    )
}
