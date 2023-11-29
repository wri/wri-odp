import React from 'react'
import Header from '@/components/_shared/Header'
import TeamHeaderCard from '@/components/team/TeamHeaderCard'
import TeamTab from '@/components/team/TeamTab'
import Footer from '@/components/_shared/Footer'
import { Breadcrumbs } from '@/components/_shared/Breadcrumbs'
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/router'
import { api } from '@/utils/api'
import Spinner from '@/components/_shared/Spinner'
import SubTeams from '@/components/team/SubTeams'
import DatasetTopic from '@/components/topics/DatasetTopic'
import DatasetTeams from '@/components/team/DatasetTeams'

const links = [
    { label: 'Teams', url: '/teams', current: false },
    { label: 'Team 1', url: '/topics/team1', current: true },
]

export default function teams() {
    const router = useRouter()
    const { teamsName } = router.query
    const { data, isLoading: topicIsLoading } =
        api.teams.getGeneralTeam.useQuery({
            search: teamsName as string,
            page: { start: 0, rows: 100 },
            tree: true,
        })

    const links = [
        { label: 'Teams', url: '/teams', current: false },
        {
            label: teamsName as string,
            url: `/teams/${teamsName as string}`,
            current: true,
        },
    ]

    return (
        <>
            <NextSeo title={`${teamsName as string} - Teams`} />
            <Header />
            <Breadcrumbs links={links} />
            {topicIsLoading ? (
                <Spinner className="mx-auto" />
            ) : (
                <>
                    <TeamHeaderCard
                        teams={data?.teams}
                        teamsDetails={data?.teamsDetails!}
                    />
                    <SubTeams
                        teams={data?.teams}
                        teamsDetails={data?.teamsDetails!}
                    />
                    <div className="mx-auto grid w-full max-w-[1380px] gap-y-4 px-4 mt-20 font-acumin sm:px-6 xxl:px-0">
                        <DatasetTeams teams={data?.teams!} />
                    </div>
                </>
            )}
            <Footer />
        </>
    )
}
