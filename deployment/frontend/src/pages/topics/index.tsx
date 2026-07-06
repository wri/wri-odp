import Header from '@/components/_shared/Header';
import Footer from '@/components/_shared/Footer';
import TopicsSearch from '@/components/topics/TopicsSearch';
import { NextSeo } from 'next-seo';
import { api } from '@/utils/api';
import { useState } from 'react';
import Spinner from '@/components/_shared/Spinner';
import type { SearchInput } from '@/schema/search.schema';
import Pagination from '@/components/datasets/Pagination';
import { getServerAuthSession } from '@/server/auth';
import { type GetServerSidePropsContext, type InferGetServerSidePropsType } from 'next';
import { appRouter } from '@/server/api/root';
import { createServerSideHelpers } from '@trpc/react-query/server';
import superjson from 'superjson';
import { env } from '@/env.mjs';
import dynamic from 'next/dynamic';
import { Breadcrumbs } from '@/components/_shared/Breadcrumbsv2';

const TopicsSearchResults = dynamic(() => import('@/components/topics/TopicsSearchResults'));

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await getServerAuthSession(context);
    const helpers = createServerSideHelpers({
        router: appRouter,
        ctx: { session, ip: undefined },
        transformer: superjson,
    });
    await helpers.topics.getGeneralTopics.prefetch({
        search: '',
        page: { start: 0, rows: 10 },
    });

    return {
        props: {
            trpcState: helpers.dehydrate(),
        },
    };
}

export default function TopicsPage(
    props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
    const [pagination, setPagination] = useState<SearchInput>({
        search: '',
        page: { start: 0, rows: 10 },
    });
    const [query, setQuery] = useState<string>('');
    const { data, isLoading } = api.topics.getGeneralTopics.useQuery(
        {
            search: query,
            page: pagination.page,
        },
        { staleTime: 5 * 60 * 1000 }
    );

    const filteredTopics = {
        topics: (data?.topics ?? []),
        topicDetails: data?.topicDetails ?? {},
        count: data?.count ?? 0,
    };
    const links = [{ label: 'Topics', url: '/topics', current: true }];

    return (
        <>
            <NextSeo
                title="Topics"
                description="WRI Open Data Catalog, WRI Data Explorer Topics"
                openGraph={{
                    title: 'Topics',
                    description: 'WRI Open Data Catalog, WRI Data Explorer Topics',
                    url: `${env.NEXT_PUBLIC_NEXTAUTH_URL}/topics`,
                    type: 'website',
                }}
            />
            <Header />
            <Breadcrumbs links={links} />
            <TopicsSearch
                isLoading={isLoading}
                setQuery={setQuery}
                query={query}
                groupType="Topics"
            />
            <section className=" px-8 xxl:px-0  max-w-8xl mx-auto flex flex-col font-acumin text-xl font-light leading-loose text-neutral-700 gap-y-6 mt-16">
                <div className="max-w-[705px] ml-2 2xl:ml-2">
                    <div className="default-home-container w-full border-t-[4px] border-stone-900" />
                    <h3 className="pt-1 font-acumin text-xl font-light leading-loose text-neutral-700 ">
                        Browse datasets by topic to find data relevant to your work.
                    </h3>
                </div>
            </section>
            {isLoading ? (
                <div className="mx-auto h-[2898px] lg:h-[2406px]">
                    <Spinner className="mx-auto" />
                </div>
            ) : (
                <>
                    <TopicsSearchResults
                        filtered={query !== '' && query !== null && typeof query !== 'undefined'}
                        count={filteredTopics?.count ?? 0}
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
                    primary: { title: 'Explore Teams', href: '/teams' },
                    secondary: {
                        title: 'Explore Applications',
                        href: '/applications',
                    },
                }}
            />
        </>
    );
}
