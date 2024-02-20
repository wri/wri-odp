import React from 'react'
import Header from '@/components/_shared/Header'
import Layout from '@/components/dashboard/Layout'
import Approvallist from '@/components/dashboard/approval/Approvallist'
import Footer from '@/components/_shared/Footer'
import { NextSeo } from 'next-seo'
import { env } from '@/env.mjs'

export default function index() {
    return (
        <>
            <NextSeo
                title={`Approval Request - Dashboard`}
                description={`Approval Request - Dashboard -- WRI Open Data Catalog`}
                openGraph={{
                    title: `Approval Request - Dashboard`,
                    description: `Approval Request - Dashboard -- WRI Open Data Catalog`,
                    url: `${env.NEXT_PUBLIC_NEXTAUTH_URL}/dashboard/approval-request`,
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
                <Approvallist />
            </Layout>
            <Footer style="mt-0" />
        </>
    )
}
