import Header from '@/components/_shared/Header';
import Footer from '@/components/_shared/Footer';
import { NextSeo } from 'next-seo';
import { api } from '@/utils/api';
import { useState, useEffect } from 'react';
import Spinner from '@/components/_shared/Spinner';
import type { SearchInput } from '@/schema/search.schema';
import Pagination from '@/components/datasets/Pagination';
import { type GroupTree } from '@/schema/ckan.schema';
import { getServerAuthSession } from '@/server/auth';
import { type GetServerSidePropsContext, type InferGetServerSidePropsType } from 'next';
import { appRouter } from '@/server/api/root';
import { createServerSideHelpers } from '@trpc/react-query/server';
import superjson from 'superjson';
import { env } from '@/env.mjs';
import dynamic from 'next/dynamic';
import { Index } from 'flexsearch';
import { type Organization as CkanOrg } from '@portaljs/ckan';
import { Breadcrumbs } from '@/components/_shared/Breadcrumbsv2';
import TopicsSearch from '@/components/topics/TopicsSearch';

const TeamsSearchResults = dynamic(() => import('@/components/team/TeamsSearchResults'));

type Organization = CkanOrg & { numSubTeams: number };

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await getServerAuthSession(context);
    const helpers = createServerSideHelpers({
        router: appRouter,
        ctx: { session, ip: undefined },
        transformer: superjson,
    });
    await helpers.teams.getGeneralTeam.prefetch({
        search: '',
        allTree: true,
    });

    return {
        props: {
            trpcState: helpers.dehydrate(),
        },
    };
}

export default function TeamsPage(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const [pagination, setPagination] = useState<SearchInput>({
        search: '',
        page: { start: 0, rows: 10 },
    });

    const [query, setQuery] = useState<string>('');

    const { data, isLoading } = api.teams.getGeneralTeam.useQuery(
        {
            search: '',
            allTree: true,
        },
        { staleTime: 5 * 60 * 1000 }
    );
    const indexTeams = new Index({
        tokenize: 'full',
    });
    if (data?.allTeams) {
        data?.allTeams.forEach((team) => {
            indexTeams.add(
                team.id,
                JSON.stringify({
                    title: team.title,
                    description: team.description || team.notes,
                })
            );
        });
    }

    function ProcessTeams() {
        if (!data) return { teams: [], teamsDetails: {}, count: 0 };
        const filteredTeams =
            query !== ''
                ? (data?.allTeams
                      ?.filter((t) => indexTeams.search(query).includes(t.id))
                      .filter(
                          (obj, index, self) => index === self.findIndex((t) => t.id === obj.id) // Compare based on 'id' property
                      ) ?? [])
                : data.teams.filter(
                      (obj, index, self) => index === self.findIndex((t) => t.id === obj.id)
                  ); // Compare based on 'id' property
        const teams = filteredTeams.slice(
            pagination.page.start,
            pagination.page.start + pagination.page.rows
        ) as GroupTree[] | Organization[];
        const teamsDetails = data?.teamsDetails;
        return { teams, teamsDetails, count: filteredTeams.length };
    }

    const filteredTeams = ProcessTeams();
    const links = [{ label: 'Teams', url: '/teams', current: true }];

    useEffect(() => {
        if (typeof window !== 'undefined' && env.NEXT_PUBLIC_DISABLE_HOTJAR !== 'disabled') {
            const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
            w.dataLayer = w.dataLayer ?? [];
            w.dataLayer.push({
                event: 'teams_page_view',
                page_path: '/teams',
                page_section: 'teams',
            });
        }
    }, []);

    return (
        <>
            <NextSeo
                title="Teams"
                description="WRI Open Data Catalog, WRI Data Explorer Teams"
                openGraph={{
                    title: 'Teams',
                    description: 'WRI Open Data Catalog, WRI Data Explorer Teams',
                    url: `${env.NEXT_PUBLIC_NEXTAUTH_URL}/teams`,
                    type: 'website',
                }}
            />
            <Header />
            <Breadcrumbs links={links} />
            <TopicsSearch
                isLoading={isLoading}
                setQuery={setQuery}
                query={query}
                groupType="Teams"
            />

            <section className=" px-8 xxl:px-0  max-w-8xl mx-auto flex flex-col font-acumin text-xl font-light leading-loose text-neutral-700 gap-y-6 mt-16">
                <div className="max-w-[705px] ml-2 2xl:ml-2">
                    <div className="default-home-container w-full border-t-[4px] border-stone-900" />
                    <h3 className="pt-1 font-acumin text-xl font-light leading-loose text-neutral-700 ">
                        Browse datasets by WRI project or team to find data associated with specific
                        programs and initiatives. If you have questions about a dataset, contact the
                        listed point of contact or{' '}
                        <a href="mailto:data@wri.org" className="text-blue-700 underline">
                            {' '}
                            data@wri.org
                        </a>
                    </h3>
                </div>
            </section>

            {isLoading ? (
                <div className="mx-auto h-[2898px] lg:h-[2406px]">
                    <Spinner className="mx-auto" />
                </div>
            ) : (
                <>
                    <TeamsSearchResults
                        filtered={query !== '' && query !== null && typeof query !== 'undefined'}
                        count={filteredTeams.count}
                        teams={filteredTeams?.teams}
                        teamsDetails={filteredTeams?.teamsDetails}
                        subTeamCounts={data?.subTeamCounts}
                    />
                    <div className="w-full px-8 xxl:px-0 max-w-8xl mx-auto">
                        <Pagination
                            setQuery={setPagination}
                            query={pagination}
                            data={filteredTeams}
                        />
                    </div>
                </>
            )}

            <Footer
                links={{
                    primary: { title: 'Explore Topics', href: '/topics' },
                    secondary: {
                        title: 'Explore Applications',
                        href: '/applications',
                    },
                }}
            />
        </>
    );
}
