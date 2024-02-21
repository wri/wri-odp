import React from 'react'
import Header from '@/components/_shared/Header'
import Layout from '@/components/dashboard/Layout'
import TopicList from '@/components/dashboard/topics/TopicList'
import Footer from '@/components/_shared/Footer'
import { NextSeo } from 'next-seo'
import { env } from '@/env.mjs'

export default function topics() {
    return (
        <>
            <NextSeo
                title={`Topics - Dashboard`}
                description={`Topics - Dashboard -- WRI Open Data Catalog`}
                openGraph={{
                    title: `Topics - Dashboard`,
                    description: `Topics - Dashboard -- WRI Open Data Catalog`,
                    url: `${env.NEXT_PUBLIC_NEXTAUTH_URL}/dashboard/topics`,
                }}
            />
            <Header />
            <Layout>
                <TopicList />
            </Layout>
            <Footer style="mt-0" />
        </>
    )
}
