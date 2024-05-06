import React from 'react'
import Header from '@/components/_shared/Header'
import Layout from '@/components/dashboard/Layout'
import TeamList from '@/components/dashboard/teams/TeamList'
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
        ctx: { session },
        transformer: superjson,
    })

    await helpers.notification.getAllNotifications.prefetch({})
    await helpers.user.getUserCapacity.prefetch()
    await helpers.organization.getUsersOrganizations.prefetch({ search: '', page: { start: 0, rows: 10 } })
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

export default function teams(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
    return (
        <>
            <NextSeo
                title={`Teams - Dashboard`}
                description={`Teams - Dashboard -- WRI Open Data Catalog`}
                openGraph={{
                    title: `Teams - Dashboard`,
                    description: `Teams - Dashboard -- WRI Open Data Catalog`,
                    url: `${env.NEXT_PUBLIC_NEXTAUTH_URL}/dashboard/teams`,
                }}
            />
            <Header />
            <Layout>
                <TeamList />
            </Layout>
            <Footer style="mt-0" />
        </>
    )
}
