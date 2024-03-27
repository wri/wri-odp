import React from 'react'
import Image from "next/image"
import Link from 'next/link'
import { GroupTree, GroupsmDetails } from '@/schema/ckan.schema'

export interface SubtopicProps {
    title: string
    numOfDatasets: number
    img: string
}

export default function Subteamcard({
    team,
    teamsDetails,
}: {
    team: GroupTree
    teamsDetails: Record<string, GroupsmDetails>
}) {
    return (
        <Link
            href={`/teams/${team.name}`}
            className="flex flex-col w-full font-acumin gap-1"
        >
            <div className="relative w-full md:w-56 h-44">
                <Image
                    src={`${
                        teamsDetails[team.id]?.img_url
                            ? teamsDetails[team.id]?.img_url
                            : '/images/placeholders/teams/teamdefault.png'
                    }`}
                    alt="higlight"
                    fill
                    className="object-contain"
                    style={{
                        maxWidth: "100%",
                        height: "auto"
                    }} />
            </div>
            <div className="text-black text-lg font-normal line-clamp-1">{team.title}</div>
            <div className="text-black text-sm font-normal">
                {teamsDetails[team.id]?.package_count} Datasets
            </div>
        </Link>
    );
}
