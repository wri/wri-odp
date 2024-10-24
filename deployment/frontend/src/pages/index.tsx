import { Button } from '@/components/_shared/Button'
import { Hero } from '@/components/home/Hero'
import { HighlightsCarousel } from '@/components/home/HighlightsCarousel'
import { HomeFooter } from '@/components/home/HomeFooter'
import { TopicsCarousel } from '@/components/home/TopicsCarousel'
import Head from 'next/head'
import { env } from '@/env.mjs'
import { NextSeo } from 'next-seo'
import Link from 'next/link'
import { api } from '@/utils/api'
import { useState } from 'react'
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import superjson from 'superjson'
import { createServerSideHelpers } from '@trpc/react-query/server'
import { appRouter } from '@/server/api/root'
import { getServerAuthSession } from '@/server/auth'
import dynamic from 'next/dynamic'
import Spinner from '@/components/_shared/Spinner'

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
        helpers.topics.getGeneralTopics.prefetch({
            search: '',
            page: { start: 0, rows: 50 },
            allTree: true,
        }),
        helpers.dataset.getFeaturedDatasets.prefetch({
            search: '',
            page: { start: 0, rows: 8 },
            sortBy: 'metadata_modified desc',
            _isUserSearch: false,
            removeUnecessaryDataInResources: true,
        }),
    ])

    return {
        props: {
            trpcState: helpers.dehydrate(),
        },
    }
}

export default function Home(
    props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
    const [readmore, setReadmore] = useState(false)
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
            <Head>
                <title>WRI - ODP</title>
            </Head>
            <NextSeo
                title="Home Page"
                description={`WRI Open Data Catalog - Home Page`}
                openGraph={{
                    title: `Home Page`,
                    description: `WRI Open Data Catalog - Home Page`,
                    url: `${env.NEXT_PUBLIC_NEXTAUTH_URL}`,
                }}
            />
            <Hero />
            <main
                id="about-explorer"
                className="default-home-container gap-x-[4.25rem] mx-auto grid grid-cols-1 py-24 md:grid-cols-5"
            >
                <div className="col-span-2">
                    <div className="default-home-container w-full border-t-[4px] border-stone-900" />
                    <h3 className="pt-1 font-acumin text-2xl font-bold leading-loose text-stone-900">
                        About Data Explorer
                    </h3>
                </div>
                <div className="col-span-3 flex flex-col gap-y-4">
                    <div
                        className={`w-full font-acumin text-xl font-light leading-loose text-neutral-700  md:overflow-hidden md:max-h-[100vh] transition duration-300 ease-in-out h-auto`}
                    >
                        <p>
                            WRI believes that good data is the foundation of
                            good decision-making. Data Explorer is the central
                            repository for WRI data, making it freely available
                            in line with{' '}
                            <a
                                href="https://www.wri.org/data/open-data-commitment"
                                className=" text-blue-600 underline"
                                target="_blank"
                            >
                                our Open Data Commitment
                            </a>
                            {'. '}
                            We are still in the process of adding more datasets
                            — check back regularly for updates. This page is
                            managed by the{' '}
                            <a
                                href="https://www.wri.org/data/data-lab"
                                className="text-blue-600 underline"
                            >
                                {' '}
                                Data Lab
                            </a>
                            {'. '}
                            If you are not able to find the data you're looking
                            for or have other feedback to share, please reach
                            out to{' '}
                            <a
                                href="mailto:data@wri.org"
                                className="text-blue-600 underline"
                            >
                                {' '}
                                data@wri.org
                            </a>
                            {'.'}
                        </p>
                    </div>
                </div>
            </main>

            <main className="flex min-h-screen flex-col items-center justify-center gap-y-8 bg-neutral-50 py-20">
                <div className="topics-carousel relative !ml-auto w-full max-w-[94.5vw] py-10">
                    <h3 className="font-acumin text-2xl font-bold leading-loose text-stone-900">
                        Explore Topic
                    </h3>
                    <div className="py-4">
                        <TopicsCarousel />
                    </div>
                </div>
                <div className="highlights-carousel relative !ml-auto w-full max-w-[94.5vw]">
                    <div className="default-home-container w-full border-t-[4px] border-stone-900" />
                    <h3 className="pt-1 font-acumin text-2xl font-bold leading-loose text-stone-900">
                        Highlights
                    </h3>
                    <div className="py-4">
                        <HighlightsCarousel />
                    </div>
                </div>
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
                    <div
                        id="highlights"
                        className="max-w-[90.5vw] mx-auto flex flex-col font-acumin gap-y-6 mt-16"
                    >
                        <h1 className="font-bold text-[2rem] ml-2">
                            Recently Added
                        </h1>
                        <Recent
                            datasets={recentlyAdded.datasets}
                            title="Recently added"
                        />
                    </div>
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
                    <div
                        id="highlights"
                        className="max-w-[90.8vw] mx-auto flex flex-col font-acumin gap-y-6 mt-16"
                    >
                        <h1 className="font-bold text-[2rem] ml-2">
                            Recently Updated
                        </h1>
                        <Recent
                            datasets={recentlyUpdated.datasets}
                            title="Recently updated"
                        />
                    </div>
                )}
            </main>
            <HomeFooter />
        </>
    )
}
