import React from 'react'
import Header from '@/components/_shared/Header'
import Layout from '@/components/dashboard/Layout'
import ApplicationList from '@/components/dashboard/applications/ApplicationList'
import Footer from '@/components/_shared/Footer'
import { NextSeo } from 'next-seo'
import { env } from '@/env.mjs'

import { getServerAuthSession } from '../../../server/auth'
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import superjson from 'superjson'
import { createServerSideHelpers } from '@trpc/react-query/server'
import { appRouter } from '@/server/api/root'

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await getServerAuthSession(context)
    const helpers = createServerSideHelpers({
        router: appRouter,
        ctx: { session, ip: undefined },
        transformer: superjson,
    })

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

export default function applications() {
    return (
        <>
            <NextSeo
                title={`Applications - Dashboard`}
                description={`Applications - Dashboard -- WRI Open Data Catalog`}
                openGraph={{
                    title: `Applications - Dashboard`,
                    description: `Applications - Dashboard -- WRI Open Data Catalog`,
                    url: `${env.NEXT_PUBLIC_NEXTAUTH_URL}/dashboard/applications`,
                }}
            />
            <Header />
            <Layout>
                <ApplicationList />
            </Layout>
            <Footer style="mt-0" />
        </>
    )
}
