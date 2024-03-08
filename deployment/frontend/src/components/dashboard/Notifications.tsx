import React from 'react'
import {
    ArrowPathIcon,
    ArrowRightIcon,
    Squares2X2Icon,
} from '@heroicons/react/24/outline'
import Image from 'next/image'
import Link from 'next/link'
import { DefaultTooltip } from '../_shared/Tooltip'
import { api } from '@/utils/api'
import Spinner from '../_shared/Spinner'
import { NotificationType } from '@/schema/notification.schema'

function Notification({ items }: { items: NotificationType }) {
    return (
        <div className="flex flex-col sm:flex-row gap-x-4 group hover:bg-slate-100 p-2 pt-2 px-3 pb-3 mb-2 rounded-md">
            <div className="flex gap-x-3">
                {items?.is_unread ? (
                    <DefaultTooltip content="unread">
                        <div className="w-2 h-2 rounded-full bg-wri-gold my-auto"></div>
                    </DefaultTooltip>
                ) : (
                    <div className="w-2 h-2 rounded-full bg-wri-gold my-auto invisible"></div>
                )}

                <div className="relative w-10 h-10">
                    {items.sender_image ? (
                        <Image
                            src={`${items.sender_image}`}
                            fill
                            alt=""
                            className="rounded-md"
                        />
                    ) : (
                        <Image
                            src={`https://gravatar.com/avatar/${items?.sender_emailHash}?s=270&d=identicon`}
                            alt="Gravatar"
                            fill
                            className="rounded-md"
                        />
                    )}
                </div>
            </div>
            <div className="flex flex-col">
                <p className="font-normal text-base">
                    <Link
                        href={`/dashboard/users?q=${items?.sender_name}`}
                        className="group-hover:underline"
                    >
                        {items?.sender_name}{' '}
                    </Link>
                    {items?.msg}{' '}
                    <Link
                        href={`/${items?.object_type}s/${items?.objectIdName}`}
                        className="group-hover:underline"
                    >
                        {items?.object_name}
                    </Link>
                </p>
                {items.time_sent ? (
                    <span className="text-[#666666] font-tight text-[12px] ">
                        {items.time_text}
                    </span>
                ) : (
                    ''
                )}
            </div>
        </div>
    )
}
export default function Notifications({ drag }: { drag: boolean }) {
    const { data, isLoading } = api.notification.getAllNotifications.useQuery({returnLength: true})

    if (isLoading) return <Spinner className="mx-auto" />

    console.log('data: ', data)
    return (
        <section
            id="favourites"
            className={`p-6 pb-4 w-full shadow-wri h-full overflow-y-auto ${
                drag ? 'border-dashed border border-wri-black ' : ''
            }`}
        >
            {drag ? (
                <DefaultTooltip content="drag">
                    <div className="absolute top-0 -left-5">
                        <Squares2X2Icon className="w-4 h-4 text-wri-black" />
                    </div>
                </DefaultTooltip>
            ) : (
                ''
            )}
            <div className="flex px-2 mb-6 pb-2 border-b-[0.3px] border-b-gray-100">
                <div className="flex gap-x-2">
                    <p className="font-normal text-[20px]">Notifications </p>
                    {isLoading ? (
                        <Spinner className="w-2 h-2" />
                    ) : data?.length ? (
                        <DefaultTooltip
                            content={`${
                                data.filter((item) => item.is_unread).length
                            } unread`}
                        >
                            <div className="rounded-full my-auto w-4 h-4 bg-wri-gold font-bold text-[11px] flex justify-center items-center">
                                {data.filter((item) => item.is_unread).length}
                            </div>
                        </DefaultTooltip>
                    ) : (
                        ''
                    )}
                </div>
                <Link
                    href="/dashboard/notifications"
                    className="ml-auto flex items-center font-semibold gap-x-1 text-[14px] text-wri-green"
                >
                    <span>See all</span>{' '}
                    <ArrowRightIcon className="w-4 h-4 mb-1" />
                </Link>
            </div>
            {data?.length
                ? data?.slice(0, 6).map((items) => {
                      return <Notification key={items.id} items={items} />
                  })
                : 'No notifications'}
        </section>
    )
}
