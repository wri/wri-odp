import React from 'react'
import Header from '@/components/_shared/Header'
import Layout from '@/components/dashboard/Layout'
import DatasetList from '@/components/dashboard/datasets/DatasetList'
import Footer from '@/components/_shared/Footer'
import { NextSeo } from 'next-seo'
import { env } from '@/env.mjs'
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import superjson from 'superjson'
import { createServerSideHelpers } from '@trpc/react-query/server'
import { appRouter } from '@/server/api/root'
import { getServerAuthSession } from '../../../server/auth'

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await getServerAuthSession(context)
    const helpers = createServerSideHelpers({
        router: appRouter,
        ctx: { session },
        transformer: superjson,
    })

    await helpers.notification.getAllNotifications.prefetch({})
    await helpers.user.getUserCapacity.prefetch()
    await helpers.dataset.getAllDataset.prefetch({
        search: '',
        page: { start: 0, rows: 10 },
        _isUserSearch: true,
        fq: {
            is_approved: 'true',
            draft: 'false',
        },
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

export default function DatasetListPage(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
    return (
        <>
            <NextSeo
                title={`Datasets - Dashboard`}
                description={`Datasets - Dashboard -- WRI Open Data Catalog`}
                openGraph={{
                    title: `Datasets - Dashboard`,
                    description: `Datasets - Dashboard -- WRI Open Data Catalog`,
                    url: `${env.NEXT_PUBLIC_NEXTAUTH_URL}/dashboard/datasets`,
                }}
            />
            <Header />
            <Layout>
                <DatasetList />
            </Layout>
            <Footer style="mt-0" />
        </>
    )
}
