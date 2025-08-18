import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { GroupTree, GroupsmDetails } from '@/schema/ckan.schema'
import { visibilityTypeLabels } from '@/utils/constants'
import Chip from '@/components/_shared/Chip'

interface SubtopicProps {
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
                    alt="highlight"
                    fill
                    className="object-cover"
                />
            </div>
            <div className="text-black text-lg font-normal line-clamp-1">
                {team.title}
            </div>
            {'visibility' in team && team.visibility === 'private' && (
                <div className="mt-2 mb-1">
                    <Chip
                        text={
                            visibilityTypeLabels[
                            team.visibility
                            ] ?? ''
                        }
                        className={""}
                    />
                </div>
            )}
            <div className="text-black text-sm font-normal">
                {teamsDetails[team.id]?.package_count} Datasets
            </div>
        </Link>
    )
}
