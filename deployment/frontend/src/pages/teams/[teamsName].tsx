import React from 'react'
import Header from '@/components/_shared/Header'
import TeamHeaderCard from '@/components/team/TeamHeaderCard'
import TeamTab from '@/components/team/TeamTab'
import Footer from '@/components/_shared/Footer'
import { Breadcrumbs } from '@/components/_shared/Breadcrumbs'
import { NextSeo } from 'next-seo'

const links = [
    { label: 'Teams', url: '/teams', current: false },
    { label: 'Team 1', url: '/topics/team1', current: true },
]

export default function teams() {
    const team = { title: 'Team Title', name: 'Team Name' }

    return (
        <>
            <NextSeo title={`${team?.title ?? team?.name} - Teams`} />
            <Header />
            <Breadcrumbs links={links} />
            <TeamHeaderCard />
            <TeamTab />
            <Footer />
        </>
    )
}
