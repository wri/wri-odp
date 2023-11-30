import React from 'react'
import Image from 'next/image'
import { ChevronLeftIcon } from '@heroicons/react/20/solid'
import { Button } from '../_shared/Button'
import { PencilSquareIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { GroupTree, GroupsmDetails } from '@/schema/ckan.schema'
import { useSession } from 'next-auth/react'
import { api } from '@/utils/api'
import Spinner from '../_shared/Spinner'
import EditCard from './EditCard'

export default function TeamHeaderCard({
    teams,
    teamsDetails,
}: {
    teams?: GroupTree[]
    teamsDetails: Record<string, GroupsmDetails>
}) {
    const { data: session } = useSession()

    teams = teams as GroupTree[]
    const team = teams[0] as GroupTree
    let authorized = session && session.user?.sysadmin ? true : false
    const enableQuery = session && !authorized
    const orgdetails = api.teams.getTeam.useQuery(
        { id: team.id },
        {
            enabled: !!enableQuery,
        }
    )

    return (
        <section
            id="team-header-card"
            className=" w-full flex flex-col md:flex-row max-w-9xl mx-auto  font-acumin gap-y-4 sm:mt-12"
        >
            <div className="relative w-full sm:px-6 md:px-0 md:w-[40%] xxl:w-[540px] h-[296px]">
                <div className="absolute top-[78%] flex h-[68px] w-56 items-center justify-center rounded-t-[3px] bg-white ">
                    <Link
                        href="/teams"
                        className="inline-flex items-center justify-center ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-amber-400 text-stone-900 font-bold font-acumin hover:bg-yellow-500 h-11 px-6 py-4 rounded-[3px] text-base"
                    >
                        <ChevronLeftIcon className="mb-1 mr-1 h-6 w-6" />
                        <span>See all teams</span>
                    </Link>
                </div>
                <div className="w-full h-full border-b-2 border-b-wri-green  shadow flex justify-center items-center">
                    <div className=" relative  w-[393px] h-[128px] ">
                        <Image
                            src={`${
                                teamsDetails[team.id]?.img_url
                                    ? teamsDetails[team.id]?.img_url
                                    : '/images/placeholders/teams/teamdefault.png'
                            }`}
                            alt="Team card"
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>
            </div>
            <div className="w-full px-2 md:w-fit flex flex-col justify-center gap-y-3 md:pl-8">
                {authorized && !enableQuery ? (
                    <>
                        <Link
                            href={`/dashboard/teams/${team.name}/edit`}
                            className="flex outline-wri-gold outline-1 outline font-bold text-[14px] text-black rounded-md px-6 py-3 gap-x-1 w-fit"
                        >
                            <div className="mr-1 w-fit h-[14px]">Edit</div>
                            <PencilSquareIcon className="h-4 w-4" />
                        </Link>
                    </>
                ) : (
                    <></>
                )}
                {enableQuery ? (
                    <EditCard
                        userName={session?.user?.name as string}
                        orgDetails={orgdetails?.data!}
                        isLoading={orgdetails?.isLoading}
                        teamName={team.name}
                    />
                ) : (
                    <></>
                )}
                <div className="flex flex-col md:w-[90%] lg:w-[579.33px] gap-y-2 ">
                    <h2 className="font-bold text-[2.063rem]">{team.title}</h2>
                    <p className="line-clamp-3 font-light text-[1.125rem]">
                        {teamsDetails[team.id]?.description}
                    </p>
                    <div className="flex items-center gap-3">
                        <div className="text-base font-light text-black">
                            {teamsDetails[team.id]?.package_count &&
                            (teamsDetails[team.id]?.package_count as number) <=
                                1
                                ? `${teamsDetails[team.id]
                                      ?.package_count} Dataset`
                                : `${teamsDetails[team.id]
                                      ?.package_count} Datasets`}
                        </div>
                        <div className="h-[18px] w-[1px] border border-black"></div>
                        <div className="text-base font-light text-black">
                            {team.children.length <= 1
                                ? `${team.children.length} Subteam`
                                : `${team.children.length} Subeams`}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
