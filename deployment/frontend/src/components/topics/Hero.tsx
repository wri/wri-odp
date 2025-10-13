import Image from 'next/image'
import { Button } from '../_shared/Button'
import { ChevronLeftIcon } from '@heroicons/react/20/solid'
import { useState } from 'react'
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline'
import { type GroupTree, type GroupsmDetails } from '@/schema/ckan.schema'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { api } from '@/utils/api'
import { PencilSquareIcon } from '@heroicons/react/24/outline'
import EditCard from './EditCard'
import { type Group } from '@portaljs/ckan'
import Topic from '@/interfaces/topic.interface'

export function Hero({
    topics,
    topicsDetails,
}: {
    topics?: GroupTree[]
    topicsDetails: Record<string, GroupsmDetails>
}) {
    topics = topics!
    const topic = topics[0]!
    const { data: session } = useSession()
    const authorized = session && session.user?.sysadmin ? true : false
    const enableQuery = session && !authorized
    const topicdetails = api.topics.getTopicV2.useQuery(
        { id: topic.id },
        {
            enabled: !!enableQuery,
        }
    )
    return (
        <section className="flex flex-col">
            <div className="w-full max-w-[1380px] mx-auto flex  space-x-4 px-4 sm:px-6 xxl:px-0 font-acumin mt-[25px]">
                <Link
                    href={`/topics${
                        topic.parent_name ? `/${topic.parent_name}` : ''
                    }`}
                    className="inline-flex items-center justify-center ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-amber-400 border text-stone-900 font-bold font-acumin hover:bg-amber-400 h-11 px-2  py-6 rounded-[3px] text-base"
                >
                    <ChevronLeftIcon className="mb-1 lg:mr-1 h-6 w-6 p-0" />
                    <span className="pr-2">{`${
                        topic.parent_name ? 'back' : 'See all Topics'
                    } `}</span>
                </Link>
            </div>
            <div>
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
                            className="object-cover"
                        />
                    </div>
                    <div className="flex flex-col gap-y-1 px-4 py-6 lg:col-span-3">
                        {authorized && !enableQuery ? (
                            <>
                                <Link
                                    href={`/dashboard/topics/${topic.name}/edit`}
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
                                userName={session?.user?.name!}
                                topicDetails={topicdetails.data?.topic!}
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
                                {topicsDetails[topic.id]?.package_count}{' '}
                                Dataset(s)
                            </div>
                            <div className="h-[18px] w-[1px] border border-black"></div>
                            <div className="text-base font-light text-black">
                                {topic.children.length} SubTopic(s)
                            </div>
                        </div>
                        <CopyLink />
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
