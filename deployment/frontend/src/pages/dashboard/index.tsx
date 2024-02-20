import React from 'react'
import Header from '@/components/_shared/Header'
import Layout from '@/components/dashboard/Layout'
import Dashboard from '@/components/dashboard/Dashboard'
import Footer from '@/components/_shared/Footer'
import { getServerAuthSession } from '../../server/auth'
import type { GetServerSideProps } from 'next'
import { NextSeo } from 'next-seo'
import { env } from '@/env.mjs'

export default function index() {
    return (
        <>
            <NextSeo
                title={`Dashboard`}
                noindex={true}
                nofollow={true}
                description={`Dashboard - WRI Open Data Catalog`}
                openGraph={{
                    title: `Dashboard`,
                    description: `Dashboard - WRI Open Data Catalog`,
                    url: `${env.NEXT_PUBLIC_NEXTAUTH_URL}/dashboard`,
                }}
            />
            <Header />
            <Layout>
                <Dashboard />
            </Layout>
            <Footer
                links={{
                    primary: { title: 'Advanced Search', href: '/search' },
                    secondary: { title: 'Explore Topics', href: '/topics' },
                }}
                style="mt-0"
            />
        </>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getServerAuthSession(context)

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
            session,
        },
    }
}
