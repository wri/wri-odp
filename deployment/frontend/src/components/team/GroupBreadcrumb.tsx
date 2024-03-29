import { GroupTree, GroupsmDetails } from '@/schema/ckan.schema'
import { Breadcrumbs } from '@/components/_shared/Breadcrumbs'
import React from 'react'
import Spinner from '../_shared/Spinner'

export default function GroupBreadcrumb({
    groups,
    isLoading,
    groupType,
}: {
    isLoading: boolean
    groups: GroupTree[]
    groupType: 'teams' | 'topics'
}) {
    if (isLoading) return <Spinner className="mx-auto" />
    const group = groups[0] as GroupTree

    const links = [
        {
            label: `${groupType === 'teams' ? 'Teams' : 'Topics'}`,
            url: `/${groupType}`,
            current: false,
        },
        {
            label: group.title ?? group.name,
            url: `/${groupType}/${group.name}`,
            current: true,
        },
    ]

    return <Breadcrumbs links={links} />
}
