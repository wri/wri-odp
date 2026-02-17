import React from 'react';
import Header from '@/components/_shared/Header';
import TeamHeaderCard from '@/components/team/TeamHeaderCard';
import Footer from '@/components/_shared/Footer';
import { Breadcrumbs } from '@/components/_shared/Breadcrumbs';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import SubTeams from '@/components/team/SubTeams';
import DatasetTeams from '@/components/team/DatasetTeams';
import {
    type GetServerSidePropsContext,
    type InferGetServerSidePropsType,
} from 'next';
import { getOrganizationTreeDetails } from '@/utils/apiUtils';
import { getServerAuthSession } from '@/server/auth';
import { type GroupsmDetails, type GroupTree } from '@/schema/ckan.schema';
import { appRouter } from '@/server/api/root';
import { createServerSideHelpers } from '@trpc/react-query/server';
import superjson from 'superjson';
import { env } from '@/env.mjs';
import { useEffect } from 'react';

export async function getServerSideProps(
    context: GetServerSidePropsContext<{ teamsName: string }>
) {
    const teamsName = context.params?.teamsName!;
    const query = {
        search: teamsName,
        page: { start: 0, rows: 100 },
        tree: true,
    };
    const session = await getServerAuthSession(context);
    const helpers = createServerSideHelpers({
        router: appRouter,
        ctx: { session, ip: undefined },
        transformer: superjson,
    });
    try {
        const teams = await getOrganizationTreeDetails({
            input: query,
            session: session,
        });

        if (teams.teams.length === 0) {
            throw new Error('Teams not found');
        }

        const team = teams.teams[0]!;
        const teamTitle = team.title ?? team.name;

        await helpers.dataset.getAllDataset.prefetch({
            search: '',
            fq: {
                organization: teamsName,
            },
            page: {
                start: 0,
                rows: 100,
            },
        });

        await helpers.teams.getTeam.prefetch({ id: team.id });
        return {
            props: {
                trpcState: helpers.dehydrate(),
                teams,
                teamTitle,
                teamsName,
            },
        };
    } catch {
        return {
            props: {},
            redirect: {
                destination: '/teams/404',
            },
        };
    }
}
export default function teams(
    props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
    const router = useRouter();
    const data = props.teams as {
        teams: GroupTree[];
        teamsDetails: Record<string, GroupsmDetails>;
        count: number;
    };
    const teamName = props.teamsName!;
    const teamTitle = props.teamTitle!;

    const links = [
        {
            label: `Teams`,
            url: `/teams`,
            current: false,
        },
        {
            label: teamTitle,
            url: `/teams/${teamName}`,
            current: true,
        },
    ];

    useEffect(() => {
        if (typeof window !== 'undefined' && env.NEXT_PUBLIC_DISABLE_HOTJAR !== 'disabled') {
            const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
            w.dataLayer = w.dataLayer ?? [];
            w.dataLayer.push({
                event: 'team_detail_view',
                page_path: `/teams/${teamName}`,
                page_section: 'teams',
                team_name: teamName,
                team_title: teamTitle,
            });
        }
    }, [teamName, teamTitle]);

    return (
        <>
            <NextSeo
                title={`${teamTitle} - Teams`}
                description={`WRI Open Data Catalog, WRI Data Explorer Teams - ${teamTitle}`}
                openGraph={{
                    title: `${teamTitle} - Teams`,
                    description: `WRI Open Data Catalog, WRI Data Explorer Teams - ${teamTitle}`,
                    url: `${env.NEXT_PUBLIC_NEXTAUTH_URL}/teams/${teamName}`,
                }}
            />
            <Header />
            <Breadcrumbs links={links} />

            <TeamHeaderCard
                teams={data?.teams}
                teamsDetails={data?.teamsDetails}
            />
            <SubTeams teams={data?.teams} teamsDetails={data?.teamsDetails} />
            <div className="mx-auto grid w-full max-w-[1380px] gap-y-4 px-4 mt-20 font-acumin sm:px-6 xxl:px-0">
                <DatasetTeams teams={data?.teams} key={router.asPath} />
            </div>

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
