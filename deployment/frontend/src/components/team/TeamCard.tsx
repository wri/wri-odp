import React from 'react'
import Image from 'next/image'
import Team from '@/interfaces/team.interface'
import { GroupTree, GroupsmDetails } from '@/schema/ckan.schema'
import { api } from '@/utils/api'
import { Organization } from '@portaljs/ckan'
import Link from 'next/link'

//write a typeguard to check if the topic is a GroupTree
function isGroupTree(org: GroupTree | Organization): org is GroupTree {
    return (org as GroupTree).children !== undefined
}

export default function TeamCard({
    team,
    teamsDetails,
}: {
    team: GroupTree | (Organization & { numSubTeams: number })
    teamsDetails: Record<string, GroupsmDetails>
}) {
    const { data: numOfSubTeams } = api.teams.getNumberOfSubTeams.useQuery()
    return (
        <Link
            href={`/teams/${team.name}`}
            className="text-wri-black flex flex-col w-full font-acumin max-w-[400px] ml-auto mr-auto"
        >
            <div className="relative w-full h-56 2xl:h-64">
                <Image
                    src={`${
                        teamsDetails[team.id]?.img_url
                            ? teamsDetails[team.id]?.img_url
                            : '/images/placeholders/teams/teamdefault.png'
                    }`}
                    alt={`Team - ${team.title}`}
                    fill
                    className="object-contain"
                />
            </div>
            <div className="bg-white w-[70%] pt-2 -ml-[1px] -mt-6 z-10 line-clamp-2 h-16 pb-1.5">
                <h2 className="text-2xl font-bold w-[80%]">{team.title}</h2>
            </div>
            <article className=" line-clamp-3 w-[88%] font-light text-base mt-2 leading-[1.375rem] h-16">
                {isGroupTree(team)
                    ? teamsDetails[team.id]?.description
                    : team.description}
            </article>
            <div className="flex font-light text-sm text-wri-black mt-1 leading-[1.375rem] items-center">
                {isGroupTree(team) && (
                    <span className="mr-2">
                        {teamsDetails[team.id]?.package_count &&
                        (teamsDetails[team.id]?.package_count as number) <= 1
                            ? `${teamsDetails[team.id]?.package_count} dataset`
                            : `${teamsDetails[team.id]
                                  ?.package_count} datasets`}
                    </span>
                )}
                {!isGroupTree(team) && (
                    <span className="mr-2">
                        {team.package_count &&
                        (team.package_count as number) <= 1
                            ? `${team.package_count} dataset`
                            : `${team.package_count} datasets`}
                    </span>
                )}
                {isGroupTree(team) && (
                    <>
                        <div className="border-l border-wri-black h-4  mx-2"></div>
                        <span className="ml-2">
                            {team.children.length} Subteams
                        </span>
                    </>
                )}
                {!isGroupTree(team) && numOfSubTeams && (
                    <>
                        <div className="border-l border-wri-black h-4  mx-2"></div>
                        <span className="ml-2">
                            {
                                //@ts-ignore
                                numOfSubTeams[team.name]
                            }{' '}
                            Subteams
                        </span>
                    </>
                )}
            </div>
        </Link>
    )
}
