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
            <Header />
            <Layout>
                <UserList />
            </Layout>
            <Footer style="mt-0" />
        </>
    )
}
