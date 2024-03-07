import React from 'react'
import Header from '@/components/_shared/Header'
import Layout from '@/components/dashboard/Layout'
import Approvallist from '@/components/dashboard/approval/Approvallist'
import Footer from '@/components/_shared/Footer'
import { NextSeo } from 'next-seo'
import { env } from '@/env.mjs'
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

    await helpers.notification.getAllNotifications.prefetch()
    await helpers.dataset.getPendingDatasets.prefetch({
        search: '',
        page: { start: 0, rows: 10 },
        sortBy: 'metadata_modified desc',
    })

    return {
        props: {
            trpcState: helpers.dehydrate(),
        },
    }
}

export default function index( props: InferGetServerSidePropsType<typeof getServerSideProps>) {
    return (
        <>
            <NextSeo
                title={`Approval Request - Dashboard`}
                description={`Approval Request - Dashboard -- WRI Open Data Catalog`}
                openGraph={{
                    title: `Approval Request - Dashboard`,
                    description: `Approval Request - Dashboard -- WRI Open Data Catalog`,
                    url: `${env.NEXT_PUBLIC_NEXTAUTH_URL}/dashboard/approval-request`,
                }}
            />
            <Header />
            <Layout>
                <Approvallist />
            </Layout>
            <Footer style="mt-0" />
        </>
    )
}
