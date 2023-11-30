import { WriOrganization, WriUser } from '@/schema/ckan.schema'
import React from 'react'
import Link from 'next/link'
import { PencilSquareIcon } from '@heroicons/react/24/outline'
import { Organization, Group, User } from '@portaljs/ckan'
import Spinner from '../_shared/Spinner'
import Topic from '@/interfaces/topic.interface'

export default function EditCard({
    isLoading,
    topicDetails,
    userName,
    topicName,
}: {
    isLoading: boolean
    topicDetails: Topic & {
        users: Group['users']
    }
    userName: string
    topicName: string
}) {
    if (isLoading) return <Spinner className="mx-auto" />
    const users = topicDetails?.users!
    let user = topicDetails?.users?.find((user) => user.name === userName)

    if (user) {
        const user2 = user as WriUser

        if (
            user2?.capacity &&
            ['admin', 'editor'].includes(user2?.capacity as string)
        )
            return (
                <Link
                    href={`/dashboard/topics/${topicName}/edit`}
                    className="flex outline-wri-gold outline-1 outline font-bold text-[14px] text-black rounded-md px-6 py-3 gap-x-1 w-fit"
                >
                    <div className="mr-1 w-fit h-[14px]">Edit</div>
                    <PencilSquareIcon className="h-4 w-4" />
                </Link>
            )
    }

    return null
}
