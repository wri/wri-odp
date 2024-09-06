import { Button } from '@/components/_shared/Button'
import { Hero } from '@/components/home/Hero'
import { HighlightsCarousel } from '@/components/home/HighlightsCarousel'
import { HomeFooter } from '@/components/home/HomeFooter'
import { TopicsCarousel } from '@/components/home/TopicsCarousel'
import Head from 'next/head'
import { env } from '@/env.mjs'
import { NextSeo } from 'next-seo'
import Link from 'next/link'
import { useState } from 'react'
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

    await helpers.topics.getGeneralTopics.prefetch({
        search: '',
        page: { start: 0, rows: 50 },
        allTree: true,
    })

    await helpers.dataset.getFeaturedDatasets.prefetch({
        search: '',
        page: { start: 0, rows: 8 },
        sortBy: 'metadata_modified desc',
        _isUserSearch: false,
        removeUnecessaryDataInResources: true,
    })

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
                        About the Data Explorer
                    </h3>
                </div>
                <div className="col-span-3 flex flex-col gap-y-4">
                    <div
                        className={`w-full font-acumin text-xl font-light leading-loose text-neutral-700  md:overflow-hidden md:max-h-[100vh] transition duration-300 ease-in-out h-auto`}
                    >
                        <p>
                            This page is managed by the{' '}
                            <a
                                href="https://www.wri.org/data/data-lab"
                                className=" text-blue-600 underline"
                                target="_blank"
                            >
                                Data Lab
                            </a>{' '}
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
            </main>
            <HomeFooter />
        </>
    )
}
