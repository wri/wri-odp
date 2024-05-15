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
                        About the Explorer
                    </h3>
                </div>
                <div className="col-span-3 flex flex-col gap-y-4">
                    <div
                        className={`w-full font-acumin text-xl font-light leading-loose text-neutral-700 overflow-hidden max-h-[100vh] transition duration-300 ease-in-out ${
                            readmore ? 'h-auto' : 'line-clamp-4'
                        }`}
                    >
                        <p>
                            WRI believes that good data is the foundation of
                            good decision-making. Increasing access to
                            high-quality, open data is the key to delivering for
                            protect people, nature and climate. WRI Data
                            Explorer is your entry point to data from WRI&apos;s
                            teams around the world. It is designed for you to
                            explore data on the key topics that help understand
                            and transform the human systems driving
                            unsustainable production and consumption — food,
                            land and water; energy; and cities — as well as the
                            economic, financial and governance systems that
                            underpin them.
                            <br />
                            With the Data Explorer you can:
                        </p>
                        <ul className="list-disc pl-8">
                            <li>
                                Discover: Search for data by keyword, topic, or
                                location
                            </li>
                            <li>Preview: See the data in a map or table</li>
                            <li>
                                Use: Download or access the data via our API or
                                a third-party platform
                            </li>
                            <li>
                                As the one-stop shop for all WRI data, the Data
                                Explorer covers data from our Land & Carbon Lab,
                                Global Forest Watch Open Data Portal, Resource
                                Watch, and the former Open Data Portal, in
                                addition to hundreds of other datasets. All in
                                one place.
                                <br />
                                WRI Data Explorer is managed by the Data Lab. If
                                you can’t find the data you would expect to see
                                here or have other feedback to share, reach out
                                to
                                <a
                                    href="mailto:test@gmail.com"
                                    className="text-blue-500"
                                >
                                    {' '}
                                    [add email here]
                                </a>
                            </li>
                            <li>
                                <Link
                                    href="/search"
                                    className=" text-xl text-blue-600 underline"
                                >
                                    SEARCH - Explore Data
                                </Link>
                                : Explore our data catalog by searching the
                                keywords relevant to the topics of your
                                interest. Use the Advanced Search option to
                                filter results by topic, format, language and
                                more.
                            </li>
                            <li>
                                <Link
                                    href="/search_advanced"
                                    className=" text-xl text-blue-600 underline"
                                >
                                    SEARCH - Advanced Search
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/topics"
                                    className=" text-xl text-blue-600 underline"
                                >
                                    TOPICS
                                </Link>
                                &nbsp; Explore reliable datasets filtered by the
                                topic of your interest.
                            </li>
                            <li>
                                <Link
                                    href="/teams"
                                    className=" text-xl text-blue-600 underline"
                                >
                                    TOPICS
                                </Link>
                                &nbsp;This page lets you explore all the data
                                associated with a specific WRI project or team.
                            </li>
                        </ul>
                        <p>
                            If you have questions about a project&apos;s data
                            reach out to the point of contact in the dataset or
                            to{' '}
                            <a
                                href="mailto:test@gmail.com"
                                className="text-primary-500"
                            >
                                {' '}
                                add email here
                            </a>
                        </p>
                    </div>
                    <Button
                        className="mr-auto"
                        onClick={() => {
                            setReadmore(!readmore)
                        }}
                    >{`${readmore ? 'Show less' : 'Read More'}`}</Button>
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
