import React, { useState } from 'react'
import NotificationHeader from './NotificationHeader'
import NotificationCard from './NotificationCard'
import { api } from '@/utils/api'
import Spinner from '@/components/_shared/Spinner'
import { useQuery } from 'react-query'
import Pagination from '../_shared/Pagination'
import type { SearchInput } from '@/schema/search.schema'
import { NotificationType } from '@/schema/notification.schema'

export default function NotificationList() {
    const { data, isLoading } = api.notification.getAllNotifications.useQuery()
    const [selected, setSelected] = useState<string[]>([])
    const [query, setQuery] = useState<SearchInput>({
        search: '',
        fq: {},
        page: { start: 0, rows: 10 },
    })

    const paginatedData = useQuery(
        ['paginatedNotifications', data, query],
        () => {
            const notification: NotificationType[] = []
            if (!data) return notification

            const start = query.page.start
            const rows = query.page.rows
            let slicedData = data.slice(start, start + rows)
            slicedData = slicedData.sort((a, b) => {
                const digitA = parseInt(a.time_text.split(' ')[0]!.trim())
                const digitB = parseInt(b.time_text.split(' ')[0]!.trim())
                console.log('DIGIT A-B: C', digitA, digitB, digitA - digitB)
                return digitA - digitB
            })

            return slicedData
        },
        {
            enabled: !!data,
        }
    )

    if (isLoading || paginatedData.isLoading) {
        return <Spinner className="mx-auto" />
    }

    return (
        <section className="max-w-8xl w-full mt-2">
            <NotificationHeader
                setSelected={setSelected}
                selected={selected}
                data={paginatedData.data!}
                Pagination={
                    <Pagination
                        setQuery={setQuery}
                        query={query}
                        isLoading={paginatedData.isLoading}
                        count={data?.length}
                    />
                }
            />
            <div className=" w-full">
                {paginatedData.data?.length === 0 ? (
                    <div className="pl-4 sm:pl-6 py-4">No notifications</div>
                ) : (
                    paginatedData.data?.map((notification, index) => {
                        return (
                            <NotificationCard
                                key={index}
                                rowProfile={notification}
                                selected={selected}
                                setSelected={setSelected}
                            />
                        )
                    })
                )}
            </div>
        </section>
    )
}
