import Header from '@/components/_shared/Header';
import Footer from '@/components/_shared/Footer';
import TopicsSearch from '@/components/topics/TopicsSearch';
import { NextSeo } from 'next-seo';
import { api } from '@/utils/api';
import { useState } from 'react';
import Spinner from '@/components/_shared/Spinner';
import type { SearchInput } from '@/schema/search.schema';
import { type GroupTree } from '@/schema/ckan.schema';
import Pagination from '@/components/datasets/Pagination';
import { getServerAuthSession } from '@/server/auth';
import { type GetServerSidePropsContext, type InferGetServerSidePropsType } from 'next';
import { appRouter } from '@/server/api/root';
import { createServerSideHelpers } from '@trpc/react-query/server';
import superjson from 'superjson';
import { env } from '@/env.mjs';
import dynamic from 'next/dynamic';
import { Index } from 'flexsearch';
import { type Group as CkanGroup } from '@portaljs/ckan';
import { Breadcrumbs } from '@/components/_shared/Breadcrumbsv2';
type Group = CkanGroup & { numSubtopics: number };

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
        page: { start: 0, rows: 10000 },
        allTree: true,
    });

    return {
        props: {
            trpcState: helpers.dehydrate(),
        },
    };
}

export default function TopicsPage(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const [pagination, setPagination] = useState<SearchInput>({
        search: '',
        page: { start: 0, rows: 10 },
    });
    const [query, setQuery] = useState<string>('');
    const { data, isLoading } = api.topics.getGeneralTopics.useQuery({
        search: '',
        page: { start: 0, rows: 10000 },
        allTree: true,
    });
    const indexTopics = new Index({
        tokenize: 'full',
    });
    if (data?.allTopics) {
        data?.allTopics.forEach((topic) => {
            indexTopics.add(
                topic.id,
                JSON.stringify({
                    title: topic.title,
                    description: topic.description,
                })
            );
        });
    }

    function ProcessTopics() {
        if (!data) return { topics: [], topicDetails: {}, count: 0 };
        const filteredTopics =
            query !== ''
                ? (data?.allTopics
                      ?.filter((t) => indexTopics.search(query).includes(t.id))
                      .filter(
                          (obj, index, self) => index === self.findIndex((t) => t.id === obj.id) // Compare based on 'id' property
                      ) ?? [])
                : data.topics.filter(
                      (obj, index, self) => index === self.findIndex((t) => t.id === obj.id)
                  ); // Compare based on 'id' property
        const topics = filteredTopics
            ?.slice(pagination.page.start, pagination.page.start + pagination.page.rows)
            .filter(
                (obj, index, self) => index === self.findIndex((t) => t.id === obj.id) // Compare based on 'id' property
            ) as GroupTree[] | Group[];
        const topicDetails = data.topicDetails;
        return { topics, topicDetails, count: filteredTopics?.length };
    }

    const filteredTopics = ProcessTopics();
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
