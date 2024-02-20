import React from 'react'
import Header from '@/components/_shared/Header'
import Layout from '@/components/dashboard/Layout'
import DatasetList from '@/components/dashboard/datasets/DatasetList'
import Footer from '@/components/_shared/Footer'
import { NextSeo } from 'next-seo'
import { env } from '@/env.mjs'

export default function DatasetListPage() {
    return (
        <>
            <NextSeo
                title={`Datasets - Dashboard`}
                description={`Datasets - Dashboard -- WRI Open Data Catalog`}
                openGraph={{
                    title: `Datasets - Dashboard`,
                    description: `Datasets - Dashboard -- WRI Open Data Catalog`,
                    url: `${env.NEXT_PUBLIC_NEXTAUTH_URL}/dashboard/datasets`,
                    images: [
                        {
                            url: `${env.NEXT_PUBLIC_NEXTAUTH_URL}/images/WRI_logo_4c.png`,
                            width: 800,
                            height: 600,
                            alt: 'Og Image Alt',
                        },
                    ],
                }}
                twitter={{
                    handle: '@WorldResources',
                    site: `${env.NEXT_PUBLIC_NEXTAUTH_URL}`,
                    cardType: 'summary_large_image',
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
