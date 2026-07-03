import React from 'react';
import Header from '@/components/_shared/Header';
import Layout from '@/components/dashboard/Layout';
import Dashboard from '@/components/dashboard/Dashboard';
import Footer from '@/components/_shared/Footer';
import { getServerAuthSession } from '../../server/auth';
import { NextSeo } from 'next-seo';
import { env } from '@/env.mjs';
import {
    type GetServerSidePropsContext,
    type InferGetServerSidePropsType,
} from 'next';
import superjson from 'superjson';
import { createServerSideHelpers } from '@trpc/react-query/server';
import { appRouter } from '@/server/api/root';

export default function index(
    props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
    return (
        <>
            <NextSeo
                title={`Dashboard`}
                noindex={true}
                nofollow={true}
                description={`Dashboard - WRI Open Data Catalog, WRI Data Explorer`}
                openGraph={{
                    title: `Dashboard`,
                    description: `Dashboard - WRI Open Data Catalog, WRI Data Explorer`,
                    url: `${env.NEXT_PUBLIC_NEXTAUTH_URL}/dashboard`,
                }}
            />
            <Header />
            <Layout>
                <Dashboard />
            </Layout>
            <Footer style="mt-0" />
        </>
    );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await getServerAuthSession(context);
    const helpers = createServerSideHelpers({
        router: appRouter,
        ctx: { session, ip: undefined },
        transformer: superjson,
    });

    await Promise.all([
        helpers.user.getUserCapacity.prefetch(),
        helpers.dashboardActivity.listActivityStreamDashboard.prefetch({
            search: '',
            page: { start: 0, rows: 6 },
        }),
        helpers.dataset.getFavoriteDataset.prefetch({ preview: true }),
        helpers.notification.getAllNotifications.prefetch({}),
        helpers.notification.getAllNotifications.prefetch({
            returnLength: true,
            limit: 6,
        }),
        helpers.dataset.getPendingDatasets.prefetch({
            search: '',
            page: { start: 0, rows: 0 },
            sortBy: 'metadata_modified desc',
        }),
    ]);

    if (!session) {
        return {
            redirect: {
                destination: '/auth/signin',
                permanent: false,
            },
        };
    }

    return {
        props: {
            trpcState: helpers.dehydrate(),
            session,
        },
    };
}
