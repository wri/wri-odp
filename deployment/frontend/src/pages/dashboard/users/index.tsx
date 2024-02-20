import React from 'react'
import Header from '@/components/_shared/Header'
import Layout from '@/components/dashboard/Layout'
import UserList from '@/components/dashboard/users/UserList'
import Footer from '@/components/_shared/Footer'
import { GroupTree, GroupsmDetails } from '@/schema/ckan.schema'
import { getServerAuthSession } from '@/server/auth'
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import { appRouter } from '@/server/api/root'
import { createServerSideHelpers } from '@trpc/react-query/server'
import superjson from 'superjson'
import { env } from '@/env.mjs'
import { NextSeo } from 'next-seo'

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await getServerAuthSession(context)
    const helpers = createServerSideHelpers({
        router: appRouter,
        ctx: { session },
        transformer: superjson,
    })
    await helpers.user.getAllUsers.prefetch({
        search: '',
        page: { start: 0, rows: 100 },
    })
    await helpers.user.getUserCapacity.prefetch()

    return {
        props: {
            trpcState: helpers.dehydrate(),
        },
    }
}

export default function topics(
    props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
    return (
        <>
            <NextSeo
                title={`Users - Dashboard`}
                description={`Users - Dashboard -- WRI Open Data Catalog`}
                openGraph={{
                    title: `Users - Dashboard`,
                    description: `Users - Dashboard -- WRI Open Data Catalog`,
                    url: `${env.NEXT_PUBLIC_NEXTAUTH_URL}/dashboard/users`,
                }}
            />
            <Header />
            <Layout>
                <UserList />
            </Layout>
            <Footer style="mt-0" />
        </>
    )
}
