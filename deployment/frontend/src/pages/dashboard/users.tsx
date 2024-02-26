import React from 'react'
import Header from '@/components/_shared/Header'
import Layout from '@/components/dashboard/Layout'
import UserList from '@/components/dashboard/users/UserList'
import Footer from '@/components/_shared/Footer'
import { NextSeo } from 'next-seo'
import { env } from '@/env.mjs'

export default function topics() {
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
