import React from 'react'
import Header from '@/components/_shared/Header'
import Layout from '@/components/dashboard/Layout'
import NotificationList from '@/components/dashboard/notification/NotificationList'
import Footer from '@/components/_shared/Footer'
import { NextSeo } from 'next-seo'
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import { appRouter } from '@/server/api/root'
import { createServerSideHelpers } from '@trpc/react-query/server'
import superjson from 'superjson'

import { getServerAuthSession } from '@/server/auth'

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await getServerAuthSession(context)
    const helpers = createServerSideHelpers({
        router: appRouter,
        ctx: { session },
        transformer: superjson,
    })
    await helpers.notification.getAllNotifications.prefetch()
    return {
        props: {
            trpcState: helpers.dehydrate(),
        },
    }
}

export default function Notifications() {
    return (
        <>
            <NextSeo title={`Notifications - Dashboard`} />
            <Header />
            <Layout>
                <NotificationList />
            </Layout>
            <Footer style="mt-0" />
        </>
    )
}
