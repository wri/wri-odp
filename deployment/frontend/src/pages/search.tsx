import Search from '@/components/Search'
import Header from '@/components/_shared/Header'
import Highlights from '@/components/Highlights'
import Recent from '@/components/Recent'
import Footer from '@/components/_shared/Footer'
import { useState } from 'react'
import { Filter } from '@/interfaces/search.interface'
import { api } from '@/utils/api'
import Spinner from '@/components/_shared/Spinner'
import { ErrorAlert } from '@/components/_shared/Alerts'
import RedirectedSearchInput from '@/components/search/RedirectedSearchInput'
import { NextSeo } from 'next-seo'
import { env } from '@/env.mjs'

export default function SearchPage() {
    const {
        data: recentlyAdded,
        isLoading: isLoadingRecentlyAdded,
        error: errorRecentlyAdded,
    } = api.dataset.getAllDataset.useQuery({
        search: '',
        page: { rows: 8, start: 0 },
        sortBy: 'metadata_created desc',
    })

    const {
        data: recentlyUpdated,
        isLoading: isLoadingRecentlyUpdated,
        error: errorRecentlyUpdated,
    } = api.dataset.getAllDataset.useQuery({
        search: '',
        page: { rows: 8, start: 0 },
        sortBy: 'metadata_modified desc',
    })

    return (
        <>
            <NextSeo
                title="Explore Data"
                description={`Explore WRI Open Data Catalog`}
                openGraph={{
                    title: `Explore Data`,
                    description: `Explore WRI Open Data Catalog`,
                    url: `${env.NEXT_PUBLIC_NEXTAUTH_URL}/search`,
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
            <RedirectedSearchInput />
            <Highlights />
            {isLoadingRecentlyAdded ? (
                <div className="w-full flex justify-center items-center h-10">
                    <Spinner />
                </div>
            ) : errorRecentlyAdded ? (
                <ErrorAlert
                    title="Failed to load recently added datasets"
                    text={errorRecentlyAdded.message}
                />
            ) : (
                <Recent
                    datasets={recentlyAdded.datasets}
                    title="Recently added"
                />
            )}
            {isLoadingRecentlyUpdated ? (
                <div className="w-full flex justify-center items-center h-10">
                    <Spinner />
                </div>
            ) : errorRecentlyUpdated ? (
                <ErrorAlert
                    title="Failed to load recently updated datasets"
                    text={errorRecentlyUpdated.message}
                />
            ) : (
                <Recent
                    datasets={recentlyUpdated.datasets}
                    title="Recently updated"
                />
            )}
            <Footer
                links={{
                    primary: { title: 'Explore Topics', href: '/topics' },
                    secondary: {
                        title: 'Advanced Search',
                        href: '/search_advanced',
                    },
                }}
            />
        </>
    )
}
