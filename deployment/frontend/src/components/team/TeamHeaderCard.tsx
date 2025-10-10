import React, { useState } from 'react'
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
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline'
import { useEffect } from 'react'
import { WriUser } from '@/schema/ckan.schema'
import Chip from '../_shared/Chip'
import { visibilityTypeLabels } from '@/utils/constants'

async function getCascadingUserCapacity(
    utils: ReturnType<typeof api.useUtils>,
    orgId: string,
    username: string
): Promise<string | undefined> {
    let currentId = orgId

    while (currentId) {
        const data = await utils.teams.getTeam.fetch({ id: currentId })
        const user = data.users?.find((u) => u.name === username)
        if (user?.capacity) return user.capacity
        currentId = data.parent ?? ''
    }

    return undefined
}

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

    const [currentUserCapacity, setCurrentUserCapacity] = useState<
        string | undefined
    >(undefined)
    const utils = api.useUtils()

    useEffect(() => {
        if (!session?.user?.name || !team?.id || currentUserCapacity) return

        const fallback = async () => {
            const localRole = orgdetails.data?.users?.find(
                (u: WriUser) => u.name === session.user.name
            )?.capacity
            const next =
                localRole ||
                (await getCascadingUserCapacity(
                    utils,
                    team.id,
                    session.user.name!
                ))

            if (next) {
                setCurrentUserCapacity(next)
            }
        }

        fallback().catch(console.error)
    }, [session?.user?.name, team?.id, orgdetails.data])

    let canEdit = currentUserCapacity === 'admin'

    return (
        <section id="team-header-card" className="flex flex-col">
            <div className="w-full max-w-[1380px] mx-auto flex  space-x-4 px-4 sm:px-6 xxl:px-0 font-acumin mt-[25px]">
                <Link
                    href={`/teams${
                        team.parent_name ? `/${team.parent_name}` : ''
                    }`}
                    className="inline-flex items-center justify-center ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-amber-400 border text-stone-900 font-bold font-acumin hover:bg-amber-400 h-11 px-2  py-6 rounded-[3px] text-base"
                >
                    <ChevronLeftIcon className="mb-1 lg:mr-1 h-6 w-6 p-0" />
                    <span className="pr-2">{`${
                        team.parent_name ? 'back' : 'See all Teams'
                    } `}</span>
                </Link>
            </div>
            <div>
                <div className="mx-auto mb-8 mt-10 grid max-w-[1440px] font-acumin lg:mb-16 lg:max-h-[18.5rem] lg:grid-cols-5">
                    <div className="relative h-[18.5rem] lg:col-span-2">
                        <Image
                            alt="Team name"
                            fill={true}
                            src={`${
                                teamsDetails[team.id]?.img_url
                                    ? teamsDetails[team.id]?.img_url
                                    : '/images/placeholders/teams/teamsdefault.png'
                            }`}
                            className="object-cover"
                        />
                    </div>
                    <div className="flex flex-col gap-y-1 px-4 py-6 lg:col-span-3">
                        {(authorized && !enableQuery) || canEdit ? (
                            <>
                                <Link
                                    href={`/dashboard/teams/${team.name}/edit`}
                                    className="flex outline-wri-gold outline-1 outline font-bold text-[14px] text-black rounded-md px-6 py-3 gap-x-1 w-fit"
                                >
                                    <div className="mr-1 w-fit h-[14px]">
                                        Edit
                                    </div>
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
                            <h2 className="font-bold text-[2.063rem]">
                                {team.title}
                            </h2>
                            {team.visibility === 'private' && (
                                <div className="mb-2">
                                    <Chip
                                        text={
                                            visibilityTypeLabels[
                                                team.visibility
                                            ] ?? ''
                                        }
                                        className=""
                                    />
                                </div>
                            )}
                            <p className="line-clamp-3 font-light text-[1.125rem]">
                                {teamsDetails[team.id]?.description ||
                                    team.description ||
                                    teamsDetails[team.id]?.notes ||
                                    team.notes}
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="text-base font-light text-black">
                                    {teamsDetails[team.id]?.package_count &&
                                    (teamsDetails[team.id]
                                        ?.package_count as number) <= 1
                                        ? `${
                                              teamsDetails[team.id]
                                                  ?.package_count
                                          } Dataset`
                                        : `${
                                              teamsDetails[team.id]
                                                  ?.package_count
                                          } Datasets`}
                                </div>
                                <div className="h-[18px] w-[1px] border border-black"></div>
                                <div className="text-base font-light text-black">
                                    {team.children.length <= 1
                                        ? `${team.children.length} SubTeam`
                                        : `${team.children.length} SubTeams`}
                                </div>
                            </div>
                            <CopyLink />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

function CopyLink() {
    const [clicked, setClicked] = useState(false)
    return (
        <>
            {!clicked ? (
                <Button
                    onClick={async () => {
                        await navigator.clipboard.writeText(
                            window.location.href
                        )
                        setClicked(!clicked)
                        setTimeout(() => {
                            setClicked(false)
                        }, 3000)
                    }}
                    variant="default"
                    className="mr-auto mt-3"
                >
                    Share Teams
                </Button>
            ) : (
                <button
                    onClick={() => setClicked(!clicked)}
                    className="mt-3 flex h-auto max-w-[578px] gap-2 rounded-sm border border-amber-400 px-5 py-3"
                >
                    <ClipboardDocumentIcon className="h-6 w-6 text-gray-800" />
                    <div className="max-w-[30rem]">
                        <p className="text-start text-sm font-semibold text-black">
                            Link copied to clipboard
                        </p>
                        <p className="text-start text-sm font-light">
                            Make sure that the users who you are sharing the
                            collection with, have permissions to see it.
                        </p>
                    </div>
                </button>
            )}
        </>
    )
}
