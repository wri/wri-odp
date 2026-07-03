import { Hero } from '@/components/home/Hero';
import { HomeFooter } from '@/components/home/HomeFooter';
import { TopicsCarousel } from '@/components/home/TopicsCarousel';
import Head from 'next/head';
import { env } from '@/env.mjs';
import { NextSeo } from 'next-seo';
import Link from 'next/link';
import { api } from '@/utils/api';
import { useState } from 'react';
import { type GetServerSidePropsContext, type InferGetServerSidePropsType } from 'next';
import superjson from 'superjson';
import { createServerSideHelpers } from '@trpc/react-query/server';
import { appRouter } from '@/server/api/root';
import { getServerAuthSession } from '@/server/auth';
import dynamic from 'next/dynamic';
import Spinner from '@/components/_shared/Spinner';
import { Tab } from '@headlessui/react';
import { Fragment } from 'react';
import classNames from '@/utils/classnames';
import { ApplicationsCarousel } from '@/components/home/ApplicationCarousel';
import { ArrowRightIcon } from '@heroicons/react/24/solid';
import { type WriDataset } from '@/schema/ckan.schema';

const ErrorAlert = dynamic<{ text: string; title?: string }>(
    () => import('@/components/_shared/Alerts').then((module) => module.ErrorAlert),
    {
        ssr: false,
    }
);
const Recent = dynamic(() => import('@/components/Recent'));

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await getServerAuthSession(context);
    const helpers = createServerSideHelpers({
        router: appRouter,
        ctx: { session, ip: undefined },
        transformer: superjson,
    });

    await Promise.all([
        helpers.topics.getTopicsHomePage.prefetch(),
        helpers.dataset.getFeaturedDatasets.prefetch({
            search: '',
            page: { start: 0, rows: 8 },
            sortBy: 'metadata_modified desc',
            _isUserSearch: false,
            removeUnecessaryDataInResources: true,
        }),
        helpers.applications.getAllApplications.prefetch(),
    ]);

    return {
        props: {
            trpcState: helpers.dehydrate(),
        },
    };
}

export default function Home(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const [readmore, setReadmore] = useState(false);
    const [datasetTabIndex, setDatasetTabIndex] = useState(0);

    const homepageDatasetQuery = {
        search: '',
        page: { rows: 8, start: 0 },
        removeUnecessaryDataInResources: true,
        includeTeamVisibility: false,
    } as const;

    const {
        data: recentlyAdded,
        isLoading: isLoadingRecentlyAdded,
        error: errorRecentlyAdded,
    } = api.dataset.getAllDataset.useQuery(
        {
            ...homepageDatasetQuery,
            sortBy: 'metadata_created desc',
        },
        { enabled: datasetTabIndex === 1 }
    );

    const {
        data: recentlyUpdated,
        isLoading: isLoadingRecentlyUpdated,
        error: errorRecentlyUpdated,
    } = api.dataset.getAllDataset.useQuery(
        {
            ...homepageDatasetQuery,
            sortBy: 'metadata_modified desc',
        },
        { enabled: datasetTabIndex === 2 }
    );
    const {
        data: featuredDatasets,
        isLoading: isLoadingFeaturedDatasets,
        error: errorFeaturedDatasets,
    } = api.dataset.getFeaturedDatasets.useQuery({
        search: '',
        page: { start: 0, rows: 8 },
        sortBy: 'metadata_modified desc',
        removeUnecessaryDataInResources: true,
    });
    const { data: application, isLoading, error } = api.applications.getAllApplications.useQuery();
    return (
        <>
            <Head>
                <title>WRI - ODP</title>
            </Head>
            <NextSeo
                title="Home Page"
                description={`WRI Open Data Catalog, WRI Data Explorer - Home Page`}
                openGraph={{
                    title: `Home Page`,
                    description: `WRI Open Data Catalog, WRI Data Explorer - Home Page`,
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
                        About WRI Data Explorer
                    </h3>
                </div>
                <div className="col-span-3 flex flex-col gap-y-4">
                    <div
                        className={`w-full font-acumin text-[23px] font-light leading-[30px] text-[#3F3F3F]  md:overflow-hidden md:max-h-[100vh] transition duration-300 ease-in-out h-auto`}
                    >
                        <p>
                            WRI believes that good data is the foundation of good decision-making.
                            WRI Data Explorer is the central repository for data from World
                            Resources Institute, making it freely available as part of our{' '}
                            <a
                                href="https://www.wri.org/data/open-data-commitment"
                                className=" text-blue-600 underline"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Open Data Commitment
                            </a>
                            {'. '}
                            You can search and download datasets across climate, energy, food and
                            land use—and apply them in your own analysis, research or tools.
                            <br /><br />
                            We are continuing to add new datasets. Check back regularly for updates,
                            or sign up to receive email notifications when new datasets are
                            published.
                            <br /><br />
                            This page is managed by the
                            <a
                                href="https://www.wri.org/data/data-lab"
                                className="text-blue-600 underline"
                            >
                                {' '}
                                WRI Data Lab
                            </a>
                            {'. '}
                            If you cannot find the data you're looking for or have feedback to
                            share, contact{' '}
                            <a href="mailto:data@wri.org" className="text-blue-600 underline">
                                {' '}
                                data@wri.org
                            </a>
                            {'.'}
                        </p>
                    </div>
                </div>
            </main>

            <main className="flex min-h-screen flex-col bg-neutral-50 py-20">
                <Tab.Group>
                    <Tab.List className="flex gap-x-12 items-center max-w-[94.5vw] ml-auto w-full">
                        <Tab as={Fragment}>
                            {({ selected }) => (
                                <div
                                    className={classNames(
                                        'text-black text-2xl font-medium font-acumin cursor-pointer',
                                        selected
                                            ? 'text-[#32864b] underline underline-offset-8'
                                            : ''
                                    )}
                                >
                                    Explore by Topic
                                </div>
                            )}
                        </Tab>
                        {application && application.length > 0 && (
                            <Tab as={Fragment}>
                                {({ selected }) => (
                                    <div
                                        className={classNames(
                                            'text-black text-2xl font-medium font-acumin cursor-pointer',
                                            selected
                                                ? 'text-[#32864b] underline underline-offset-8'
                                                : ''
                                        )}
                                    >
                                        Explore by Application
                                    </div>
                                )}
                            </Tab>
                        )}
                    </Tab.List>
                    <Tab.Panels>
                        <Tab.Panel className="topics-carousel relative !ml-auto w-full max-w-[94.5vw]">
                            <Link
                                href="/topics"
                                className="flex justify-end pr-5 text-lg font-semibold pb-3 items-center gap-x-2"
                            >
                                See all <ArrowRightIcon className="h-4 w-4 inline-block" />
                            </Link>
                            <TopicsCarousel />
                        </Tab.Panel>
                        <Tab.Panel className="highlights-carousel relative !ml-auto w-full max-w-[94.5vw]">
                            <Link
                                href="/applications"
                                className="flex justify-end pr-5 text-lg font-semibold pb-3 items-center gap-x-2"
                            >
                                See all <ArrowRightIcon className="h-4 w-4 inline-block" />
                            </Link>
                            <ApplicationsCarousel />
                        </Tab.Panel>
                    </Tab.Panels>
                </Tab.Group>
                <Tab.Group onChange={setDatasetTabIndex}>
                    <Tab.List className="flex gap-x-12 items-center max-w-[94.5vw] ml-auto w-full pt-20 pb-8">
                        <Tab as={Fragment}>
                            {({ selected }) => (
                                <div
                                    className={classNames(
                                        'text-black text-2xl font-medium font-acumin cursor-pointer',
                                        selected
                                            ? 'text-[#32864b] underline underline-offset-8'
                                            : ''
                                    )}
                                >
                                    Dataset Highlights
                                </div>
                            )}
                        </Tab>
                        <Tab as={Fragment}>
                            {({ selected }) => (
                                <div
                                    className={classNames(
                                        'text-black text-2xl font-medium font-acumin cursor-pointer',
                                        selected
                                            ? 'text-[#32864b] underline underline-offset-8'
                                            : ''
                                    )}
                                >
                                    Recently added
                                </div>
                            )}
                        </Tab>
                        <Tab as={Fragment}>
                            {({ selected }) => (
                                <div
                                    className={classNames(
                                        'text-black text-2xl font-medium font-acumin cursor-pointer',
                                        selected
                                            ? 'text-[#32864b] underline underline-offset-8'
                                            : ''
                                    )}
                                >
                                    Recently updated
                                </div>
                            )}
                        </Tab>
                    </Tab.List>
                    <Tab.Panels>
                        <Tab.Panel>
                            {isLoadingFeaturedDatasets ? (
                                <div className="w-full flex justify-center items-center h-10">
                                    <Spinner />
                                </div>
                            ) : errorFeaturedDatasets ? (
                                <ErrorAlert
                                    title="Failed to load highlights"
                                    text={errorFeaturedDatasets.message}
                                />
                            ) : (
                                <div
                                    id="highlights"
                                    className="max-w-[90.5vw] mx-auto flex flex-col font-acumin gap-y-6"
                                >
                                    <Recent
                                        datasets={featuredDatasets.datasets as WriDataset[]}
                                        title="Featured Datasets"
                                    />
                                </div>
                            )}
                        </Tab.Panel>
                        <Tab.Panel>
                            {isLoadingRecentlyAdded ? (
                                <div className="w-full flex justify-center items-center h-10">
                                    <Spinner />
                                </div>
                            ) : errorRecentlyAdded ? (
                                <ErrorAlert
                                    title="Failed to load recently added Datasets"
                                    text={errorRecentlyAdded.message}
                                />
                            ) : (
                                <div
                                    id="highlights"
                                    className="max-w-[90.5vw] mx-auto flex flex-col font-acumin gap-y-6"
                                >
                                    <Recent
                                        datasets={recentlyAdded.datasets}
                                        title="Recently added"
                                    />
                                </div>
                            )}
                        </Tab.Panel>
                        <Tab.Panel>
                            {isLoadingRecentlyUpdated ? (
                                <div className="w-full flex justify-center items-center h-10">
                                    <Spinner />
                                </div>
                            ) : errorRecentlyUpdated ? (
                                <ErrorAlert
                                    title="Failed to load recently updated Datasets"
                                    text={errorRecentlyUpdated.message}
                                />
                            ) : (
                                <div
                                    id="highlights"
                                    className="max-w-[90.5vw] mx-auto flex flex-col font-acumin gap-y-6"
                                >
                                    <Recent
                                        datasets={recentlyUpdated.datasets}
                                        title="Recently updated"
                                    />
                                </div>
                            )}
                        </Tab.Panel>
                    </Tab.Panels>
                </Tab.Group>
            </main>
            <HomeFooter />
        </>
    );
}
