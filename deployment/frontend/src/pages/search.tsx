import Header from '@/components/_shared/Header'
import Highlights from '@/components/Highlights'
import Footer from '@/components/_shared/Footer'
import { api } from '@/utils/api'
import Spinner from '@/components/_shared/Spinner'
import RedirectedSearchInput from '@/components/search/RedirectedSearchInput'
import { NextSeo } from 'next-seo'
import { env } from '@/env.mjs'
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import superjson from 'superjson'
import { createServerSideHelpers } from '@trpc/react-query/server'
import { appRouter } from '@/server/api/root'
import { getServerAuthSession } from '@/server/auth'
import dynamic from 'next/dynamic'

const ErrorAlert = dynamic<{ text: string; title?: string }>(
    () =>
        import('@/components/_shared/Alerts').then(
            (module) => module.ErrorAlert
        ),
    {
        ssr: false,
    }
)

const Recent = dynamic(() => import('@/components/Recent'))

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await getServerAuthSession(context)
    const helpers = createServerSideHelpers({
        router: appRouter,
        ctx: { session },
        transformer: superjson,
    })
    await Promise.all([
        helpers.dataset.getFeaturedDatasets.prefetch({
            search: '',
            page: { start: 0, rows: 8 },
            sortBy: 'metadata_modified desc',
            _isUserSearch: false,
            removeUnecessaryDataInResources: true,
        }),
        helpers.dataset.getAllDataset.prefetch({
            search: '',
            page: { start: 0, rows: 8 },
            sortBy: 'metadata_created desc',
            removeUnecessaryDataInResources: true,
        }),
    ])
    return {
        props: {
            trpcState: helpers.dehydrate(),
        },
    }
}

export default function SearchPage(
    props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
    const {
        data: recentlyAdded,
        isLoading: isLoadingRecentlyAdded,
        error: errorRecentlyAdded,
    } = api.dataset.getAllDataset.useQuery({
        search: '',
        page: { rows: 8, start: 0 },
        sortBy: 'metadata_created desc',
        removeUnecessaryDataInResources: true,
    })

    const {
        data: recentlyUpdated,
        isLoading: isLoadingRecentlyUpdated,
        error: errorRecentlyUpdated,
    } = api.dataset.getAllDataset.useQuery({
        search: '',
        page: { rows: 8, start: 0 },
        sortBy: 'metadata_modified desc',
        removeUnecessaryDataInResources: true,
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
            <section className=" px-8 xxl:px-0  max-w-8xl mx-auto flex flex-col font-acumin text-xl font-light leading-loose text-neutral-700 gap-y-6 mt-16">
                <div className="max-w-[705px] ml-2 2xl:ml-2">
                    <div className="default-home-container w-full border-t-[4px] border-stone-900" />
                    <h3 className="pt-1 font-bold font-acumin text-xl font-light leading-loose text-neutral-700 ">
                        Explore our data catalog by searching for specific
                        keywords, such as “tree cover,” “water,” “power plants,”
                        “roads,” “biodiversity” or “climate models.” Use the
                        Advanced Search option to filter results by topic,
                        format, language and more.
                    </h3>
                </div>
            </section>
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
