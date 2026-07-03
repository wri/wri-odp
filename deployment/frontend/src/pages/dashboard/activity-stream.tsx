import React from 'react';
import Header from '@/components/_shared/Header';
import Layout from '@/components/dashboard/Layout';
import ActivityList from '@/components/dashboard/activitystream/ActivityList';
import Footer from '@/components/_shared/Footer';
import { NextSeo } from 'next-seo';
import { env } from '@/env.mjs';
import { getServerAuthSession } from '@/server/auth';
import {
    type GetServerSidePropsContext,
    type InferGetServerSidePropsType,
} from 'next';
import superjson from 'superjson';
import { createServerSideHelpers } from '@trpc/react-query/server';
import { appRouter } from '@/server/api/root';

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await getServerAuthSession(context);
    const helpers = createServerSideHelpers({
        router: appRouter,
        ctx: { session, ip: undefined },
        transformer: superjson,
    });
    await Promise.all([
        helpers.dashboard.getLayoutBadges.prefetch(),
        helpers.dashboardActivity.listActivityStreamDashboard.prefetch({
            search: '',
            fq: {},
            page: { start: 0, rows: 1000 },
        }),
        helpers.organization.getAllOrganizations.prefetch(),
        helpers.topics.getAllTopics.prefetch(),
    ]);

    return {
        props: {
            trpcState: helpers.dehydrate(),
        },
    };
}

export default function activityStream(
    props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
    return (
        <>
            <NextSeo
                title={`Activity Stream - Dashboard`}
                description={`Activity Stream - Dashboard -- WRI Open Data Catalog, WRI Data Explorer`}
                openGraph={{
                    title: `Activity Stream - Dashboard`,
                    description: `Activity Stream - Dashboard -- WRI Open Data Catalog, WRI Data Explorer`,
                    url: `${env.NEXT_PUBLIC_NEXTAUTH_URL}/dashboard/activity-stream`,
                }}
            />
            <Header />
            <Layout>
                <ActivityList />
            </Layout>
            <Footer style="mt-0" />
        </>
    );
}
