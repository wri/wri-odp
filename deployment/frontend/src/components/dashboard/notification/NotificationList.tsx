import React, { useState } from 'react';
import NotificationHeader from './NotificationHeader';
import NotificationCard from './NotificationCard';
import { api } from '@/utils/api';
import Spinner from '@/components/_shared/Spinner';
import Pagination from '../_shared/Pagination';
import type { SearchInput } from '@/schema/search.schema';

export default function NotificationList() {
    const [selected, setSelected] = useState<string[]>([]);
    const [query, setQuery] = useState<SearchInput>({
        search: '',
        fq: {},
        page: { start: 0, rows: 10 },
    });

    const { data, isLoading } = api.notification.getAllNotifications.useQuery({
        returnLength: true,
        limit: 200,
        includeCount: true,
    });

    const notifications =
        data && 'notifications' in data ? data.notifications : [];
    const totalCount =
        data && 'count' in data ? data.count : notifications.length;

    const paginatedNotifications = notifications.slice(
        query.page.start,
        query.page.start + query.page.rows
    );

    if (isLoading) {
        return <Spinner className="mx-auto" />;
    }

    return (
        <section className="max-w-8xl w-full mt-2">
            <NotificationHeader
                setSelected={setSelected}
                selected={selected}
                data={paginatedNotifications}
                Pagination={
                    <Pagination
                        setQuery={setQuery}
                        query={query}
                        isLoading={isLoading}
                        count={totalCount}
                    />
                }
            />
            <div className=" w-full">
                {paginatedNotifications.length === 0 ? (
                    <div className="pl-4 sm:pl-6 py-4">No notifications</div>
                ) : (
                    paginatedNotifications.map((notification, index) => {
                        return (
                            <NotificationCard
                                key={notification.id ?? index}
                                rowProfile={notification}
                                selected={selected}
                                setSelected={setSelected}
                            />
                        );
                    })
                )}
            </div>
        </section>
    );
}
