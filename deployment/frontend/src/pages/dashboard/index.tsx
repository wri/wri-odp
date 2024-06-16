import React from 'react'
import Header from '@/components/_shared/Header'
import Layout from '@/components/dashboard/Layout'
import Dashboard from '@/components/dashboard/Dashboard'
import Footer from '@/components/_shared/Footer'
import { getServerAuthSession } from '../../server/auth'
import { NextSeo } from 'next-seo'
import { env } from '@/env.mjs'
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import superjson from 'superjson'
import { createServerSideHelpers } from '@trpc/react-query/server'
import { appRouter } from '@/server/api/root'

export default function index(
    props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
    return (
        <>
            <NextSeo
                title={`Dashboard`}
                noindex={true}
                nofollow={true}
                description={`Dashboard - WRI Open Data Catalog`}
                openGraph={{
                    title: `Dashboard`,
                    description: `Dashboard - WRI Open Data Catalog`,
                    url: `${env.NEXT_PUBLIC_NEXTAUTH_URL}/dashboard`,
                }}
            />
            <Header />
            <Layout>
                <Dashboard />
            </Layout>
            <Footer
                links={{
                    primary: { title: 'Advanced Search', href: '/search' },
                    secondary: { title: 'Explore Topics', href: '/topics' },
                }}
                style="mt-0"
            />
        </>
    )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await getServerAuthSession(context)
    const helpers = createServerSideHelpers({
        router: appRouter,
        ctx: { session },
        transformer: superjson,
    })

    await Promise.all([
        helpers.notification.getAllNotifications.prefetch({
            returnLength: true,
        }),
        helpers.user.getUserCapacity.prefetch(),

        helpers.dataset.getPendingDatasets.prefetch({
            search: '',
            page: { start: 0, rows: 10 },
            sortBy: 'metadata_modified desc',
        }),

        helpers.dataset.getFavoriteDataset.prefetch(),
        helpers.dashboardActivity.listActivityStreamDashboard.prefetch({
            search: '',
            page: { start: 0, rows: 6 },
        }),
    ])

    if (!session) {
        return {
            redirect: {
                destination: '/auth/signin',
                permanent: false,
            },
        }
    }

    return {
        props: {
            trpcState: helpers.dehydrate(),
            session,
        },
    }
}
