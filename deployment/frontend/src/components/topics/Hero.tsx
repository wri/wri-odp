import Image from 'next/image'
import { Button } from '../_shared/Button'
import { ChevronLeftIcon } from '@heroicons/react/20/solid'
import { useState } from 'react'
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline'
import { GroupTree, GroupsmDetails } from '@/schema/ckan.schema'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { api } from '@/utils/api'
import { PencilSquareIcon } from '@heroicons/react/24/outline'
import EditCard from './EditCard'
import { Group } from '@portaljs/ckan'

export function Hero({
    topics,
    topicsDetails,
}: {
    topics?: GroupTree[]
    topicsDetails: Record<string, GroupsmDetails>
}) {
    topics = topics as GroupTree[]
    const topic = topics[0] as GroupTree
    const { data: session } = useSession()
    let authorized = session && session.user?.sysadmin ? true : false
    const enableQuery = session && !authorized
    const topicdetails = api.topics.getTopic.useQuery(
        { id: topic.id },
        {
            enabled: !!enableQuery,
        }
    )
    return (
        <div className="mx-auto mb-8 mt-10 grid max-w-[1440px] font-acumin lg:mb-16 lg:max-h-[18.5rem] lg:grid-cols-5">
            <div className="relative h-[18.5rem] lg:col-span-2">
                <Image
                    alt="Topic name"
                    fill={true}
                    src={`${
                        topicsDetails[topic.id]?.img_url
                            ? topicsDetails[topic.id]?.img_url
                            : '/images/placeholders/topics/topicsdefault.png'
                    }`}
                    className="object-contain"
                />
                <div className="absolute bottom-0 z-10 flex lg:h-[68px] lg:w-56 px-4 py-4 items-center justify-center rounded-t-[3px] bg-white">
                    <Link
                        href="/topics"
                        className="inline-flex items-center justify-center ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-amber-400 text-stone-900 font-bold font-acumin hover:bg-yellow-500 h-11 px-6 py-4 rounded-[3px] text-base"
                    >
                        <ChevronLeftIcon className="mb-1 lg:mr-1 h-6 w-6" />
                        <span>See all topics</span>
                    </Link>
                </div>
            </div>
            <div className="flex flex-col gap-y-1 px-4 py-6 lg:col-span-3">
                {authorized && !enableQuery ? (
                    <>
                        <Link
                            href={`/dashboard/topics/${topic.name}/edit`}
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
                        topicDetails={
                            topicdetails?.data as Topic & {
                                users: Group['users']
                            }
                        }
                        isLoading={topicdetails?.isLoading}
                        topicName={topic.name}
                    />
                ) : (
                    <></>
                )}
                <div className="text-[33px] font-bold text-black">
                    {topic.title}
                </div>
                <div className="max-w-[578.85px] text-lg font-light text-black">
                    {topicsDetails[topic.id]?.description}
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-base font-light text-black">
                        {topicsDetails[topic.id]?.package_count} Dataset(s)
                    </div>
                    <div className="h-[18px] w-[1px] border border-black"></div>
                    <div className="text-base font-light text-black">
                        {topic.children.length} Subtopic(s)
                    </div>
                </div>
                <CopyLink />
            </div>
        </div>
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
                    variant="outline"
                    className="mr-auto mt-3"
                >
                    Share Topic
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
