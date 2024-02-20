import React from 'react'
import Header from '@/components/_shared/Header'
import Layout from '@/components/dashboard/Layout'
import ActivityList from '@/components/dashboard/activitystream/ActivityList'
import Footer from '@/components/_shared/Footer'
import { NextSeo } from 'next-seo'
import { env } from '@/env.mjs'

export default function activityStream() {
    return (
        <>
            <NextSeo
                title={`Activity Stream - Dashboard`}
                description={`Activity Stream - Dashboard -- WRI Open Data Catalog`}
                openGraph={{
                    title: `Activity Stream - Dashboard`,
                    description: `Activity Stream - Dashboard -- WRI Open Data Catalog`,
                    url: `${env.NEXT_PUBLIC_NEXTAUTH_URL}/dashboard/activity-stream`,
                }}
            />
            <Header />
            <Layout>
                <ActivityList />
            </Layout>
            <Footer style="mt-0" />
        </>
    )
}
