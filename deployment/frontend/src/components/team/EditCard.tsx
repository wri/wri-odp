import { WriOrganization, WriUser } from '@/schema/ckan.schema'
import React from 'react'
import Link from 'next/link'
import { PencilSquareIcon } from '@heroicons/react/24/outline'
import { Organization } from '@portaljs/ckan'
import Spinner from '../_shared/Spinner'

export default function EditCard({
    isLoading,
    orgDetails,
    userName,
    teamName,
}: {
    isLoading: boolean
    orgDetails: Organization & { groups: Organization[] }
    userName: string
    teamName: string
}) {
    if (isLoading) return <Spinner className="mx-auto" />
    console.log('get here')
    let user = orgDetails?.users?.find((user) => user.name === userName)

    if (user) {
        const user2 = user as WriUser

        if (
            user2?.capacity &&
            ['admin', 'editor'].includes(user2?.capacity as string)
        )
            return (
                <Link
                    href={`/dashboard/teams/${teamName}/edit`}
                    className="flex outline-wri-gold outline-1 outline font-bold text-[14px] text-black rounded-md px-6 py-3 gap-x-1 w-fit"
                >
                    <div className="mr-1 w-fit h-[14px]">Edit</div>
                    <PencilSquareIcon className="h-4 w-4" />
                </Link>
            )
    }

    return null
}
